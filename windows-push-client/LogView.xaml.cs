

namespace windows_push_client
{
    using System;
    using System.Text;
    using System.Windows.Controls;
    using windows_push_client.Services;

    /// <summary>
    /// Interaction logic for LogView.xaml
    /// </summary>
    public partial class LogView : UserControl, IObserver<string>
    {
        private readonly StringBuilder sb = new StringBuilder();

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
            this.sb.AppendLine(string.Format("Stream error: {0}", error.ToString()));
            this.UpdateTextArea();            
        }

        public void OnNext(string value)
        {
            this.sb.AppendLine(value);
            this.UpdateTextArea();
        }

        private void UpdateTextArea()
        {
            this.LogTextBox.Text = this.sb.ToString();
        }
    }
}
