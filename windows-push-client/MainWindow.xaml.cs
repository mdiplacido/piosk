namespace windows_push_client
{
    using System;
    using System.Diagnostics;
    using System.Drawing;
    using System.Windows;

    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class MainWindow : Window
    {
        public MainWindow()
        {
            InitializeComponent();
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

            const string screenCapFile = @"c:\temp\screencap\browsercap.png";

            // save uncompressed bitmap to disk
            using (System.IO.FileStream fs = System.IO.File.Open(screenCapFile, System.IO.FileMode.OpenOrCreate))
            {
                screenshot.Save(fs, System.Drawing.Imaging.ImageFormat.Bmp);
            }

            Process.Start(screenCapFile);
        }

        private System.Windows.Point TopLeft()
        {
            return this.Viewport.PointToScreen(new System.Windows.Point(0, 0));
        }
    }
}
