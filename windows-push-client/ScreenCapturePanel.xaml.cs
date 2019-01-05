namespace windows_push_client
{
    using System;
    using System.Drawing;
    using System.Windows;
    using System.Windows.Controls;
    using windows_push_client.Models;

    /// <summary>
    /// Interaction logic for ScreenCapturePanel.xaml
    /// </summary>
    public partial class ScreenCapturePanel : UserControl
    {
        public ScreenCapturePanelConfig Config { get; set; }

        public ScreenCapturePanel(ScreenCapturePanelConfig config)
        {
            InitializeComponent();
            this.Config = config;
            this.Location.Text = config.Url;
        }

        private void Button_Click(object sender, RoutedEventArgs e)
        {
            this.Viewport.Navigate(this.Location.Text);
        }

        private void CaptureScreen_Click(object sender, RoutedEventArgs e)
        {
            var topLeft = this.TopLeft();
            TakeScreenshot((int)Math.Ceiling(topLeft.X), (int)Math.Ceiling(topLeft.Y), (int)Math.Ceiling(this.Viewport.ActualWidth), (int)Math.Ceiling(this.Viewport.ActualHeight));
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

