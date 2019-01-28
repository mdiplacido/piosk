namespace windows_push_client
{
    using System;
    using System.Windows.Controls;
    using windows_push_client.Models;
    using windows_push_client.Services;

    /// <summary>
    /// Interaction logic for LogView.xaml
    /// </summary>
    public partial class LogView : UserControl, IObserver<string>
    {
        private readonly Config config;

        public LogView(LoggingService logging, Config config)
        {
            InitializeComponent();
            this.config = config;
            logging.Events.Subscribe(this);
        }

        public void OnCompleted()
        {
            // no-op
        }

        public void OnError(Exception error)
        {
            this.LogTextBox.AppendText(string.Format("Stream error: {0}{1}", error.ToString(), Environment.NewLine));
            this.CleanupLogLines();
            this.LogTextBox.ScrollToEnd();
        }

        public void OnNext(string value)
        {
            this.LogTextBox.AppendText(value + Environment.NewLine);
            this.CleanupLogLines();
            this.LogTextBox.ScrollToEnd();
        }

        public void Clear()
        {
            this.LogTextBox.Document.Blocks.Clear();
        }

        private void ClearLogButton_Click(object sender, System.Windows.RoutedEventArgs e)
        {
            this.Clear();
        }

        private void CleanupLogLines()
        {
            // we let it grow past the max by 10% this way we're not always in a state
            // of truncating.  we will trim down to the max.  Eg.  1000 is max we truncate
            // whenever we hit 1100, back down to 1000 which gives us a padding of 100 events
            // between truncation.
            if (this.LogTextBox.Document.Blocks.Count < this.config.MaxLogLinesForDisplay * 1.10)
            {
                return;
            }

            var removeCount = this.LogTextBox.Document.Blocks.Count - this.config.MaxLogLinesForDisplay;

            // truncate
            while(removeCount-- > 0)
            {
                this.LogTextBox.Document.Blocks.Remove(this.LogTextBox.Document.Blocks.FirstBlock);
            }

            this.LogTextBox.AppendText("************ LOG LINES TRUNCATED ************" + Environment.NewLine);
        }
    }
}
