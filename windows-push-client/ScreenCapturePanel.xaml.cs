namespace windows_push_client
{
    using Microsoft.Toolkit.Win32.UI.Controls.Interop.WinRT;
    using System;
    using System.Drawing;
    using System.Windows;
    using System.Windows.Controls;
    using windows_push_client.Models;
    using windows_push_client.Services;

    /// <summary>
    /// Interaction logic for ScreenCapturePanel.xaml
    /// </summary>
    public partial class ScreenCapturePanel : UserControl
    {
        private bool screenCaptureInProgress = false;
        private readonly ILoggingService logger;
        public ScreenCapturePanelConfig Config { get; set; }

        public ScreenCapturePanel(ScreenCapturePanelConfig config, ILoggingService logger)
        {
            InitializeComponent();
            this.logger = logger.ScopeForFeature("ScreenCapturePanel");
            this.Config = config;
            this.Location.Text = config.Url;
            this.Viewport.NavigationCompleted += Viewport_NavigationCompleted;
        }

        private void Viewport_NavigationCompleted(object sender, WebViewControlNavigationCompletedEventArgs e)
        {
            this.logger.Verbose("WebView navigation complete for {0}, checking if screen capture needed...", this.Config.Name);

            if (this.screenCaptureInProgress)
            {
                this.logger.Verbose("Taking screen capture for {0}", this.Config.Name);
                try
                {
                    var topLeft = this.TopLeft();
                    this.TakeScreenshot((int)Math.Ceiling(topLeft.X), (int)Math.Ceiling(topLeft.Y), (int)Math.Ceiling(this.Viewport.ActualWidth), (int)Math.Ceiling(this.Viewport.ActualHeight));
                }
                finally {
                    this.screenCaptureInProgress = false;
                    this.logger.Verbose("Screen capture completed for {0}", this.Config.Name);
                }
            } else
            {
                this.logger.Verbose("Screen capture not needed, screen capture not in progress for {0}", this.Config.Name);
            }
        }

        private void Button_Click(object sender, RoutedEventArgs e)
        {
            this.Viewport.Navigate(this.Location.Text);
        }

        private void CaptureScreen_Click(object sender, RoutedEventArgs e)
        {
            this.logger.Verbose("Starting screen capture for {0}, refreshing WebView...", this.Config.Name);
            this.screenCaptureInProgress = true;
            this.Viewport.Refresh();
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
    }
}

