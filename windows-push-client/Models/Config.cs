namespace windows_push_client.Models
{
    using System;
    using System.Configuration;

    public class Config
    {
        public string DiskPath { get; set; }
        public string SFTPPublishPath { get; set; }
        public string SFTPUsername { get; set; }
        public string SFTPAddress { get; set; }
        public bool EnablePublishToSFTP { get; set; }
        public bool EnablePublishToDisk { get; set; }
        public double MinAvailableSpaceOnPi { get; set; }
        public long MaxLogFileSizeBytes { get; set; }
        public int DefaultPanelMaxCapture { get; set; }
        public TimeSpan DefaultPageSettleDelay { get; set; }

        public static Config Load()
        {
            Boolean.TryParse(ConfigurationManager.AppSettings["EnablePublishToSFTP"], out bool enableFtpPublishing);
            Boolean.TryParse(ConfigurationManager.AppSettings["EnablePublishToDisk"], out bool enableDiskPublishing);

            // try to prevent uploading too much data to the pi.  ideally the pi would have a quota, but it doesn't seem
            // easy to configure on Raspbian at the moment.  We'll assuming that this client respects the quota.  
            Double.TryParse(ConfigurationManager.AppSettings["MinAvailableSpaceOnPi"], out double minAvailableSpaceOnPi);

            Int64.TryParse(ConfigurationManager.AppSettings["MaxLogFileSizeBytes"], out long maxLogFileSizeBytes);

            Int32.TryParse(ConfigurationManager.AppSettings["DefaultPageSettleDelaySeconds"], out int defaultPageSettleDelaySeconds);

            Int32.TryParse(ConfigurationManager.AppSettings["DefaultPanelMaxCapture"], out int defaultPanelMaxCapture);

            return new Config()
            {
                DiskPath = ConfigurationManager.AppSettings["DiskPublishPath"] ?? @"/var/jail/data/piosk_pickup/",
                SFTPPublishPath = ConfigurationManager.AppSettings["SFTPPublishPath"] ?? @"/data/piosk_pickup/",
                SFTPUsername = ConfigurationManager.AppSettings["SFTPUsername"] ?? @"piosk_publisher",
                SFTPAddress = ConfigurationManager.AppSettings["SFTPAddress"] ?? @"192.168.42.1",
                // default is 50% available.
                MinAvailableSpaceOnPi = minAvailableSpaceOnPi > 0 ? minAvailableSpaceOnPi / 100 : 50 / 100,
                DefaultPageSettleDelay = defaultPageSettleDelaySeconds > 0 ? TimeSpan.FromSeconds(defaultPageSettleDelaySeconds) : TimeSpan.FromSeconds(30),
                EnablePublishToSFTP = enableFtpPublishing,
                EnablePublishToDisk = enableDiskPublishing,
                MaxLogFileSizeBytes = maxLogFileSizeBytes > 0 ? maxLogFileSizeBytes : 1024 * 1024 * 10,
                DefaultPanelMaxCapture = defaultPanelMaxCapture > 0 ? defaultPanelMaxCapture : 10,
            };
        }

        public override string ToString()
        {
            return $@"
                DiskPath: {this.DiskPath}, 
                SFTPPublishPath: {this.SFTPPublishPath}, 
                SFTPUsername: {this.SFTPUsername}, 
                SFTPAddress: {this.SFTPAddress}, 
                EnablePublishToSFTP: {this.EnablePublishToSFTP}, 
                EnablePublishToDisk: {this.EnablePublishToDisk},
                MinAvailableSpaceOnPi: {this.MinAvailableSpaceOnPi * 100}%,
                DefaultPageSettleDelaySeconds: {this.DefaultPageSettleDelay},
                MaxLogFileSizeBytes: {this.MaxLogFileSizeBytes},
                DefaultPanelMaxCapture: {this.DefaultPanelMaxCapture},
            ";
        }
    }
}

