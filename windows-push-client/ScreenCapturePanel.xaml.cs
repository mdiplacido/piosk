namespace windows_push_client
{
    using Microsoft.Toolkit.Win32.UI.Controls.Interop.WinRT;
    using System;
    using System.Drawing;
    using System.Windows;
    using System.Windows.Controls;
    using windows_push_client.Models;
    using windows_push_client.Services;
    using windows_push_client.Utility;

    /// <summary>
    /// Interaction logic for ScreenCapturePanel.xaml
    /// </summary>
    public partial class ScreenCapturePanel : UserControl
    {
        private bool screenCaptureInProgress = false;
        private readonly ILoggingService logger;
        private readonly TimedCaptureService captureService;
        private readonly Action<ScreenCapturePanel> requestFocus;
        private object captureSource;  // the thing that started the capture eg. user button click or timer
        public ScreenCapturePanelConfig Config { get; set; }

        public bool IsCaptureInProgress
        {
            get
            {
                return this.screenCaptureInProgress;
            }
        }

        private bool IsCaptureSourceTimer
        {
            get
            {
                return this.captureSource == this.captureService;
            }
        }

        public ScreenCapturePanel(ScreenCapturePanelConfig config, ILoggingService logger, TimedCaptureService captureService, Action<ScreenCapturePanel> requestFocus)
        {
            InitializeComponent();
            this.requestFocus = requestFocus;
            this.captureService = captureService;
            this.logger = logger.ScopeForFeature("ScreenCapturePanel");
            this.Config = config;
            this.Location.Text = config.Url;
            this.Viewport.NavigationCompleted += Viewport_NavigationCompleted;
        }

        public void CaptureScreen(object source)
        {
            if (this.screenCaptureInProgress)
            {
                this.logger.Warn("Skipping screen capture for {0}, screen capture in progress!", this.Config.PrettyName);
                return;
            }

            this.captureSource = source;

            this.logger.Verbose("Starting screen capture for {0}, refreshing WebView...", this.Config.PrettyName);
            this.screenCaptureInProgress = true;
            this.Navigate();
        }

        private void Viewport_NavigationCompleted(object sender, WebViewControlNavigationCompletedEventArgs e)
        {
            this.logger.Verbose("WebView navigation complete for {0}, checking if screen capture needed...", this.Config.PrettyName);

            if (!this.screenCaptureInProgress)
            {
                this.logger.Verbose("Screen capture not needed, screen capture not in progress for {0}", this.Config.PrettyName);
                return;
            }

            if (!this.IsCaptureSourceTimer)
            {
                this.logger.Verbose("Capture source is manual user click, running immediate capture");
                this.HandleScreenCapture();
            }
            else
            {
                this.logger.Verbose("Capture source is timer, running delayed capture");

                // we introduce an artificial delay before processing the capture.
                // this is DUMB!, there's no definitive way to know if the page has "settled".
                TimerUtility.RunDelayedAction(() =>
                {
                    this.requestFocus(this);

                    // delay one more tick so we give the control time to render
                    TimerUtility.RunDelayedAction(() =>
                    {
                        this.HandleScreenCapture();
                    }, TimeSpan.FromMilliseconds(100));
                }, TimeSpan.FromSeconds(5));
            }
        }

        private void Navigate_ButtonClick(object sender, RoutedEventArgs e)
        {
            this.Navigate();
        }

        private void Navigate()
        {
            // this is needed for a weird case where this panel has never been made visible before and 
            // the capture timer is asking for capture, without being made visible the WebView will start but
            // never completes, so we conditionally make this visible to allow the WebView to render which
            // will unblock its navigation.
            if (!this.IsVisible)
            {
                this.logger.Info("Panel {0} is being asked to navigate, but it is not visible, forcing visibility", this.Config.PrettyName);
                this.requestFocus(this);
            }

            this.logger.Verbose("Navigating to {0} for {1}", this.Location.Text, this.Config.PrettyName);
            this.Viewport.Navigate(this.Location.Text);
        }

        private void CaptureScreen_Click(object sender, RoutedEventArgs e)
        {
            this.CaptureScreen(this.CaptureScreenButton);
        }

        private void TakeScreenshot(int StartX, int StartY, int Width, int Height)
        {
            // Bitmap in right size
            Bitmap screenshot = new Bitmap(Width, Height);
            Graphics g = Graphics.FromImage(screenshot);
            // snip wanted area
            g.CopyFromScreen(StartX, StartY, 0, 0, new System.Drawing.Size(Width, Height), CopyPixelOperation.SourceCopy);

            string name = Guid.NewGuid().ToString();
            string screenCapFile = string.Format(@"\var\jail\data\piosk_pickup\{0}.png", name);

            // save uncompressed bitmap to disk
            using (System.IO.FileStream fs = System.IO.File.Open(screenCapFile, System.IO.FileMode.OpenOrCreate))
            {
                screenshot.Save(fs, System.Drawing.Imaging.ImageFormat.Bmp);
            }
        }

        private System.Windows.Point TopLeft()
        {
            return this.Viewport.PointToScreen(new System.Windows.Point(0, 0));
        }

        private void HandleScreenCapture()
        {
            // NOTE: at this point we assume that this panel is visible for screen capture
            this.logger.Verbose("Taking screen capture for {0}", this.Config.PrettyName);
            try
            {
                var topLeft = this.TopLeft();
                this.TakeScreenshot((int)Math.Ceiling(topLeft.X), (int)Math.Ceiling(topLeft.Y), (int)Math.Ceiling(this.Viewport.ActualWidth), (int)Math.Ceiling(this.Viewport.ActualHeight));
            }
            finally
            {
                this.screenCaptureInProgress = false;
                this.logger.Verbose("Screen capture completed for {0}", this.Config.PrettyName);
                this.Config.LastCapture = DateTime.UtcNow;

                // order matters, we do this last because we want to mark the capture as "done" before
                // we notify the capture service.
                // we only notify if the source of the screen capture was the capture service, otherwise it was the user which means we do not need
                // to notify that service
                if (this.IsCaptureSourceTimer)
                {
                    this.captureService.NotifyPanelProcessingComplete(this);
                }
            }
        }
    }
}

