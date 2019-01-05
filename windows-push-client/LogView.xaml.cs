

namespace windows_push_client
{
    using System;
    using System.Windows.Controls;
    using windows_push_client.Services;

    /// <summary>
    /// Interaction logic for LogView.xaml
    /// </summary>
    public partial class LogView : UserControl, IObserver<string>
    {
        public LogView(LoggingService logging)
        {
            InitializeComponent();
            logging.Events.Subscribe(this);
        }

        public void OnCompleted()
        {
            // no-op
        }

        public void OnError(Exception error)
        {
            this.LogTextBox.AppendText(string.Format("Stream error: {0}{1}", error.ToString(), Environment.NewLine));
            this.LogTextBox.ScrollToEnd();
        }

        public void OnNext(string value)
        {
            this.LogTextBox.AppendText(value + Environment.NewLine);
            this.LogTextBox.ScrollToEnd();
        }
    }
}
