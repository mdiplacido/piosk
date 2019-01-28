
namespace windows_push_client
{
    using System;
    using System.Windows.Controls;
    using windows_push_client.Models;

    /// <summary>
    /// Interaction logic for AddScreenCapture.xaml
    /// </summary>
    public partial class AddScreenCapture : UserControl
    {
        private int LastSetIntervalValueSeconds = 5;

        private bool isNameValid = false;
        private bool isIntervalValid = false;
        private bool isUrlValid = false;
        private bool isAuthorValid = false;

        private Action<ScreenCapturePanelConfig> saveHandler = config => { };

        public Config Config { get; set; }

        public void SetSaveHandler(Action<ScreenCapturePanelConfig> handler)
        {
            this.saveHandler = handler;
        }

        private bool IsFormValid
        {
            get
            {
                return this.isIntervalValid && this.isNameValid && this.isAuthorValid && this.isUrlValid;
            }
        }

        public AddScreenCapture()
        {
            InitializeComponent();
        }

        private void TrySetSaveEnabled()
        {
            this.AddScreenCapturePanelButton.IsEnabled = this.IsFormValid;
        }

        private void UrlTextBox_TextChanged(object sender, TextChangedEventArgs e)
        {
            this.isUrlValid = false;

            if (Uri.TryCreate(this.UrlTextBox.Text, UriKind.Absolute, out Uri theUrl) &&
                (theUrl.Scheme.Equals("http", StringComparison.OrdinalIgnoreCase) ||
                    theUrl.Scheme.Equals("https", StringComparison.OrdinalIgnoreCase)))
            {
                this.isUrlValid = true;
            }

            this.TrySetSaveEnabled();
        }

        private void AuthorTextBox_TextChanged(object sender, TextChangedEventArgs e)
        {
            this.isAuthorValid = !string.IsNullOrWhiteSpace(this.AuthorTextBox.Text);
            this.TrySetSaveEnabled();
        }

        private void NameTextBox_TextChanged(object sender, TextChangedEventArgs e)
        {
            this.isNameValid = !string.IsNullOrWhiteSpace(this.NameTextBox.Text);
            this.TrySetSaveEnabled();
        }

        private void IntervalTextBox_TextChanged(object sender, TextChangedEventArgs e)
        {
            this.isIntervalValid = false;
            if (string.IsNullOrWhiteSpace(this.IntervalTextBox.Text))
            {
                this.TrySetSaveEnabled();
                return;
            }

            if (!int.TryParse(this.IntervalTextBox.Text, out int newValue))
            {
                this.IntervalTextBox.Text = this.LastSetIntervalValueSeconds.ToString();
            }
            else
            {
                this.LastSetIntervalValueSeconds = newValue;
            }

            this.isIntervalValid = true;
            this.TrySetSaveEnabled();
        }

        private void AddScreenCapturePanelButton_Click(object sender, System.Windows.RoutedEventArgs e)
        {
            if (!this.IsFormValid)
            {
                return;
            }

            this.saveHandler(new ScreenCapturePanelConfig()
            {
                Name = this.NameTextBox.Text,
                Author = this.AuthorTextBox.Text,
                Url = this.UrlTextBox.Text,
                Interval = TimeSpan.FromSeconds(int.Parse(this.IntervalTextBox.Text)),
                MaxCaptures = this.Config.DefaultPanelMaxCapture
            });

            // reset
            this.NameTextBox.Text = String.Empty;
            this.AuthorTextBox.Text = String.Empty;
            this.IntervalTextBox.Text = this.LastSetIntervalValueSeconds.ToString();
            this.UrlTextBox.Text = "https://";
        }
}
}
