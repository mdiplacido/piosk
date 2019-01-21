namespace windows_push_client.Services
{
    using Renci.SshNet;
    using System;
    using System.IO;
    using windows_push_client.Models;

    public class SFTPPublisherService : IPublisherService
    {
        private readonly SFTPClientFactory clientFactory;
        private readonly Config config;
        private readonly ILoggingService logger;

        public SFTPPublisherService(SFTPClientFactory clientFactory, Config config, ILoggingService logger)
        {
            this.clientFactory = clientFactory;
            this.config = config;
            this.logger = logger.ScopeForFeature(this.GetType());
        }

        public void Send(PNGXPayload payload, string fileName, PublishCompleteHandler complete)
        {
            try
            {
                var rawPayload = payload.Serialize();

                using (var client = this.clientFactory.Create())
                using (var stream = new MemoryStream(rawPayload))
                {
                    client.Connect();

                    this.EnsureFreeSpace(client);

                    client.UploadFile(
                        stream,
                        Path.Combine(this.config.SFTPPublishPath, fileName),
                        length =>
                        {
                            if (length == (ulong)rawPayload.Length)
                            {
                                complete(PublishCompletionStatus.Success, $"Successfully uploaded {fileName}");
                            }
                        });
                }
            }
            catch (Exception ex)
            {
                complete(PublishCompletionStatus.Failure, $"Failed to upload file: {fileName}, got error: {ex.ToString()}");
            }
        }

        private void EnsureFreeSpace(SftpClient client)
        {
            // ensure that we have enough space before we continue uploading
            // TODO: this is blocking, make sure we keep this off the UI thread
            var status = client.GetStatus(this.config.SFTPPublishPath);

            // a block size appears to be around 4k on my current Raspbian version.
            // we'll go with just using available percentage for now.
            var currentAvailable = status.AvailableBlocks / (double)status.TotalBlocks;
            var formattedCurrentAvailable = (currentAvailable * 100).ToString("0.###");

            if (currentAvailable <= this.config.MinAvailableSpaceOnPi)
            {
                throw new ApplicationException($"Cannot continue, the server only has ${formattedCurrentAvailable}% space available!");
            }
            else
            {
                this.logger.Verbose($"the server has {formattedCurrentAvailable}% space available, continuing with upload...");
            }
        }
    }
}
