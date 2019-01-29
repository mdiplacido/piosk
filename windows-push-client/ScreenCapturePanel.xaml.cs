﻿namespace windows_push_client
{
    using Microsoft.Toolkit.Win32.UI.Controls.Interop.WinRT;
    using System;
    using System.Drawing;
    using System.Drawing.Imaging;
    using System.IO;
    using System.Windows;
    using System.Windows.Controls;
    using System.Windows.Media;
    using windows_push_client.Models;
    using windows_push_client.Services;
    using windows_push_client.Utility;

    /// <summary>
    /// Interaction logic for ScreenCapturePanel.xaml
    /// </summary>
    public partial class ScreenCapturePanel : UserControl
    {
        private readonly ILoggingService logger;
        private readonly TimedCaptureService captureService;
        private readonly Func<ScreenCapturePanel, bool> requestFocus;
        private readonly Action<ScreenCapturePanel> releaseFocus;
        private object captureSource;  // the thing that started the capture eg. user button click or timer
        public ScreenCapturePanelConfig Config { get; set; }
        private readonly ScreenCapturePublisher capturePublisher;
        private readonly Config appConfig;
        private bool hasBeenVisible = false;
        private int NavigationEventCounter = 0;

        const int DEFAULT_CAPTURE_MAX_RETRY_ATTEMPTS = 2;

        public bool IsCaptureInProgress { get; private set; } = false;

        private SafeWebView SafeViewport;

        private bool IsCaptureSourceTimer
        {
            get
            {
                return this.captureSource == this.captureService;
            }
        }

        public ScreenCapturePanel(
            Config appConfig,
            ScreenCapturePanelConfig config,
            ILoggingService logger,
            TimedCaptureService captureService,
            ScreenCapturePublisher capturePublisher,
            Func<ScreenCapturePanel, bool> requestFocus,
            Action<ScreenCapturePanel> releaseFocus)
        {
            InitializeComponent();
            this.appConfig = appConfig;
            this.capturePublisher = capturePublisher;
            this.requestFocus = requestFocus;
            this.releaseFocus = releaseFocus;
            this.captureService = captureService;
            this.logger = logger.ScopeForFeature(this);
            this.Config = config;
            this.Location.Text = config.Url;

            this.SafeViewport = new SafeWebView(this.Viewport);
            this.SafeViewport.NavigationStarting += Viewport_NavigationStarting;
            this.SafeViewport.NavigationCompleted += Viewport_NavigationCompleted;
            this.SafeViewport.NewWindowRequested += Viewport_NewWindowRequested;
        }

        public void Removing()
        {
            this.logger.Info("Disposing panel resources {0}", this.Config.PrettyName);
            if (this.SafeViewport != null)
            {
                // not going to set this.Viewport to null, as some timer handler may want to access it, and we are okay 
                // with that even though it is disposed.
                this.PanelGrid.Children.Remove(this.SafeViewport.unsafeView);
                this.SafeViewport.NavigationStarting -= Viewport_NavigationStarting;
                this.SafeViewport.NavigationCompleted -= Viewport_NavigationCompleted;
                this.SafeViewport.NewWindowRequested -= Viewport_NewWindowRequested;
                this.SafeViewport.Dispose();

                // clearing the pointer to the real Viewport.  the component should be able to function even if it is missing.
                this.Viewport = null;
            }
        }

        public void ResetState()
        {
            this.NavigationEventCounter = 0;
        }

        private void Viewport_NewWindowRequested(object sender, WebViewControlNewWindowRequestedEventArgs e)
        {
            this.logger.Info($"New window requested... for {e.Uri}, navigating to location in the current view");
            TimerUtility.RunDelayedAction(() => this.SafeViewport.Navigate(e.Uri), TimeSpan.FromMilliseconds(2000));
        }

        public bool NeedsRecycling()
        {
            return this.NavigationEventCounter >= this.Config.MaxCaptures;
        }

        public void CaptureScreen(object source)
        {
            if (this.IsCaptureInProgress)
            {
                this.logger.Warn("Skipping screen capture for {0}, screen capture in progress!", this.Config.PrettyName);
                return;
            }

            this.captureSource = source;

            this.logger.Verbose("Starting screen capture for {0}, refreshing WebView...", this.Config.PrettyName);
            this.IsCaptureInProgress = true;
            this.Navigate();
        }

        private void Viewport_NavigationStarting(object sender, WebViewControlNavigationStartingEventArgs e)
        {
            this.NavigationEventCounter++;
            this.logger.Info($"Current navigation event count for panel {this.Config.PrettyName} is {this.NavigationEventCounter}");
        }

        private void Viewport_NavigationCompleted(object sender, WebViewControlNavigationCompletedEventArgs e)
        {
            this.logger.Verbose("WebView navigation complete for {0}, checking if screen capture needed...", this.Config.PrettyName);

            if (!this.IsCaptureInProgress)
            {
                this.logger.Verbose("Screen capture not needed, screen capture not in progress for {0}", this.Config.PrettyName);
                return;
            }

            this.Viewport_NavigationCompletedImpl();
        }

        private void Viewport_NavigationCompletedImpl(int attempts = ScreenCapturePanel.DEFAULT_CAPTURE_MAX_RETRY_ATTEMPTS)
        {
            this.logger.Verbose($"running delayed capture with settle time of {this.appConfig.DefaultPageSettleDelay}...");

            // we introduce an artificial delay before processing the capture.
            // this is DUMB!, there's no definitive way to know if the page has "settled".
            TimerUtility.RunDelayedAction(() =>
            {
                // note: removed && this.IsVisible() check here, maybe that is necessary?
                if (this.requestFocus(this))
                {
                    // delay one more tick so we give the control time to render
                    TimerUtility.RunSafeDelayedAction(() =>
                    {
                        this.HandleScreenCapture();
                    },
                    TimeSpan.FromMilliseconds(2000),
                    (error) =>
                    {
                        // HandleScreenCapture should be safe.  no-op 
                        if (this.IsCaptureInProgress)
                        {
                            this.CleanupCaptureRun(success: false);
                        }
                    });
                }
                else if (attempts > 0)
                {
                    this.logger.Warn($"Panel {this.Config.PrettyName} attempting to perform screen capture, but another panel already is visible, will retry {attempts} attempts...");

                    // TODO: randomize the retry time?
                    this.Viewport_NavigationCompletedImpl(attempts - 1);
                }
                else
                {
                    // could not get focus or we ran out of attempts
                    this.logger.Error($"Panel {this.Config.PrettyName} failed to get focus after {ScreenCapturePanel.DEFAULT_CAPTURE_MAX_RETRY_ATTEMPTS} attempts");
                    this.CleanupCaptureRun(success: false);
                }
            }, this.appConfig.DefaultPageSettleDelay);
        }

        private void Navigate_ButtonClick(object sender, RoutedEventArgs e)
        {
            this.Navigate();
        }

        private void Navigate(int attempts = ScreenCapturePanel.DEFAULT_CAPTURE_MAX_RETRY_ATTEMPTS)
        {
            // this is needed for a weird case where this panel has never been made visible before and 
            // the capture timer is asking for capture, without being made visible the WebView will start but
            // never completes, so we conditionally make this visible to allow the WebView to render which
            // will unblock its navigation.
            Action doNavigate = () =>
            {
                this.logger.Verbose("Navigating to {0} for {1}", this.Location.Text, this.Config.PrettyName);
                this.SafeViewport.Navigate(this.Location.Text);
            };

            if (!hasBeenVisible && !this.IsVisible)
            {
                this.logger.Info("Panel {0} is being asked to navigate, but it is not visible, forcing visibility", this.Config.PrettyName);
                if (this.requestFocus(this))
                {
                    this.hasBeenVisible = true;
                    TimerUtility.RunDelayedAction(() =>
                    {
                        this.releaseFocus(this);

                        // now we navigate as usual, navigate completion will acquire its own focus request.
                        doNavigate();
                    }, TimeSpan.FromMilliseconds(2000));
                }
                else if (attempts > 0)
                {
                    this.logger.Warn($"Tried to force visibility for Panel {this.Config.PrettyName} but another panel is visible, {attempts} retry attempts remaining...");
                    TimerUtility.RunDelayedAction(() => this.Navigate(attempts - 1), TimeSpan.FromMilliseconds(2000));
                }
                else
                {
                    this.logger.Warn($"Tried to force visibility for Panel {this.Config.PrettyName} but another panel is visible, aborting...");
                    this.CleanupCaptureRun(success: false);
                }
            }
            else
            {
                doNavigate();
            }
        }

        private void CaptureScreen_Click(object sender, RoutedEventArgs e)
        {
            this.CaptureScreen(this.CaptureScreenButton);
        }

        private byte[] TakeScreenshot()
        {
            // we have to take a screen-shot using the Graphics interface.  asking the control to return a bitmap
            // does not work with the WebView component, at least not at the time I wrote this.
            // IMPORTANT: SCREENSHOT ONLY WORKS IF YOU ARE AT THE TERMINAL. WHAT I'VE BEEN DOING IS RUNNING
            // THIS PUSH CLIENT ON A VM AND LEAVING MY SESSION ATTACHED.  SEE DOCUMENTATION FOR MORE DETAILS.
            var topLeft = this.TopLeft();
            int StartX = (int)Math.Ceiling(topLeft.X);
            int StartY = (int)Math.Ceiling(topLeft.Y);
            int Width = (int)Math.Ceiling(this.SafeViewport.ActualWidth);
            int Height = (int)Math.Ceiling(this.SafeViewport.ActualHeight);

            if (Width == 0 || Height == 0)
            {
                return new byte[0];
            }

            // Bitmap in right size
            using (Bitmap screenshot = new Bitmap(Width, Height))
            using (Graphics g = Graphics.FromImage(screenshot))
            using (var stream = new MemoryStream())
            {
                var dpi = this.GetDPI();
                screenshot.SetResolution(dpi.Item1, dpi.Item2);

                // snip wanted area
                g.CopyFromScreen(StartX, StartY, 0, 0, new System.Drawing.Size(Width, Height), CopyPixelOperation.SourceCopy);
                screenshot.Save(stream, ImageFormat.Png);
                return stream.ToArray();
            }
        }

        private System.Windows.Point TopLeft()
        {
            return this.SafeViewport.PointToScreen(new System.Windows.Point(0, 0));
        }

        private void HandleScreenCapture()
        {
            // NOTE: at this point we assume that this panel is visible for screen capture
            this.logger.Verbose("Taking screen capture for {0}", this.Config.PrettyName);

            try
            {
                byte[] imageBytes = this.TakeScreenshot();

                if (imageBytes.Length == 0)
                {
                    this.logger.Warn($"Something wrong with capture for panel {this.Config.PrettyName}, image capture has zero bytes!");
                    this.CleanupCaptureRun(success: false);
                    return;
                }

                string name = Guid.NewGuid().ToString() + ".pngx";

                var elapsedTime = DateTime.UtcNow - new DateTime(1970, 1, 1);

                var payload = new PNGXPayload()
                {
                    Author = this.Config.Author,
                    BirthtimeMs = (long)elapsedTime.TotalMilliseconds,
                    Data = imageBytes,
                    Name = this.Config.Name,
                    Url = this.Config.Url
                };

                this.capturePublisher.Send(payload, name, (status, message) =>
                {
                    this.logger.Verbose("Capture publish complete for {0}, status: {1}, message: {2}", this.Config.PrettyName, status, message);
                });

                this.CleanupCaptureRun(success: true);
            }
            catch (InvalidOperationException ex)
            {
                this.logger.Error("Could not capture visual for panel {0}, got error {1}", this.Config.PrettyName, ex.ToString());
                this.CleanupCaptureRun(success: false);
            }
            catch (Exception ex)
            {
                this.logger.Error("Could not capture visual for panel {0}, got unexpected error {1}", this.Config.PrettyName, ex.ToString());
                this.CleanupCaptureRun(success: false);
                throw ex;
            }
        }

        private void CleanupCaptureRun(bool success)
        {
            this.IsCaptureInProgress = false;
            this.logger.Verbose("Screen capture completed for {0} with completion success: {1}", this.Config.PrettyName, success);

            if (success)
            {
                this.Config.LastCapture = DateTime.UtcNow;
            }

            // order matters, we do this last because we want to mark the capture as "done" before
            // we notify the capture service.
            // we only notify if the source of the screen capture was the capture service, otherwise it was the user which means we do not need
            // to notify that service
            if (this.IsCaptureSourceTimer)
            {
                this.captureService.NotifyPanelProcessingComplete(this);
            }

            this.releaseFocus(this);
        }

        private Tuple<float, float> GetDPI()
        {
            PresentationSource source = PresentationSource.FromVisual((Visual)this.SafeViewport.unsafeView ?? this);

            float dpiX = 96.0f, dpiY = 96.0f;

            if (source != null)
            {
                dpiX = 96.0f * (float)source.CompositionTarget.TransformToDevice.M11;
                dpiY = 96.0f * (float)source.CompositionTarget.TransformToDevice.M22;
            }

            return new Tuple<float, float>(dpiX, dpiY);
        }
    }
}

