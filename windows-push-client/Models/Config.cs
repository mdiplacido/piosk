namespace windows_push_client.Models
{
    using System;
    using System.Configuration;
    using System.Security;

    public class Config
    {
        public string DiskPath { get; set; }
        public string SFTPPublishPath { get; set; }
        public string SFTPUsername { get; set; }
        public string SFTPAddress { get; set; }
        public bool EnablePublishToSFTP { get; set; }
        public bool EnablePublishToDisk { get; set; }
        public string SFTPPassword { get; set; }
        public double MinAvailableSpaceOnPi { get; set; }

        public static Config Load()
        {
            Boolean.TryParse(ConfigurationManager.AppSettings["EnablePublishToSFTP"], out bool enableFtpPublishing);
            Boolean.TryParse(ConfigurationManager.AppSettings["EnablePublishToDisk"], out bool enableDiskPublishing);

            // try to prevent uploading too much data to the pi.  ideally the pi would have a quota, but it doesn't seem
            // easy to configure on Raspbian at the moment.  We'll assuming that this client respects the quota.  
            Double.TryParse(ConfigurationManager.AppSettings["MinAvailableSpaceOnPi"], out double minAvailableSpaceOnPi);

            return new Config()
            {
                DiskPath = ConfigurationManager.AppSettings["DiskPublishPath"] ?? @"/var/jail/data/piosk_pickup/",
                SFTPPublishPath = ConfigurationManager.AppSettings["SFTPPublishPath"] ?? @"/data/piosk_pickup/",
                SFTPUsername = ConfigurationManager.AppSettings["SFTPUsername"] ?? @"piosk_publisher",
                SFTPAddress = ConfigurationManager.AppSettings["SFTPAddress"] ?? @"192.168.42.1",
                // default is 50% available.
                MinAvailableSpaceOnPi = minAvailableSpaceOnPi > 0 ? minAvailableSpaceOnPi / 100 : 50 / 100,
                SFTPPassword = "BOB",
                EnablePublishToSFTP = enableFtpPublishing,
                EnablePublishToDisk = enableDiskPublishing,
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
                MinAvailableSpaceOnPi: {this.MinAvailableSpaceOnPi * 100}%";
        }
    }
}

