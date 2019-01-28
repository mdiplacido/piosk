namespace windows_push_client.Models
{
    using System;

    public class ScreenCapturePanelConfig
    {
        public string Name { get; set; }
        public string Url { get; set; }
        public string Author { get; set; }
        public TimeSpan Interval { get; set; }
        public int? MaxCaptures { get; set; }
        public DateTime? LastCapture { get; set; }
        public string PrettyName
        {
            get
            {
                return "\"" + this.Name + "\"";
            }
        }
    }
}
