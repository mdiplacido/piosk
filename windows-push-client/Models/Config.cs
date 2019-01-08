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
        public SecureString SFTPPassword { get; set; }

        public static Config Load()
        {
            Boolean.TryParse(ConfigurationManager.AppSettings["EnablePublishToSFTP"], out bool enableFtpPublishing);
            Boolean.TryParse(ConfigurationManager.AppSettings["EnablePublishToDisk"], out bool enableDiskPublishing);

            return new Config()
            {
                DiskPath = ConfigurationManager.AppSettings["DiskPublishPath"] ?? @"/var/jail/data/piosk_pickup/",
                SFTPPublishPath = ConfigurationManager.AppSettings["SFTPPublishPath"] ?? @"/data/piosk_pickup/",
                SFTPUsername = ConfigurationManager.AppSettings["SFTPUsername"] ?? @"piosk_publisher",
                SFTPAddress = ConfigurationManager.AppSettings["SFTPAddress"] ?? @"192.168.42.1",
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
                EnablePublishToDisk: {this.EnablePublishToDisk}";
        }
    }
}

