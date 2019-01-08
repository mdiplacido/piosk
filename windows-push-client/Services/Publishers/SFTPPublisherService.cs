namespace windows_push_client.Services
{
    using System;
    using System.IO;
    using windows_push_client.Models;

    public class SFTPPublisherService : IPublisherService
    {
        private readonly SFTPClientFactory clientFactory;
        private readonly Config config;

        public SFTPPublisherService(SFTPClientFactory clientFactory, Config config)
        {
            this.clientFactory = clientFactory;
            this.config = config;
        }

        public void Send(byte[] data, string fileName, PublishCompleteHandler complete)
        {
            try
            {
                using (var client = this.clientFactory.Create())
                using (var stream = new MemoryStream(data))
                {
                    client.Connect();

                    client.UploadFile(
                        stream,
                        Path.Combine(this.config.SFTPPublishPath, fileName),
                        length => complete(PublishCompletionStatus.Success, $"Successfully uploaded {fileName}"));
                }
            }
            catch (Exception ex)
            {
                complete(PublishCompletionStatus.Failure, $"Failed to upload file: {fileName}, got error: {ex.ToString()}");
            }
        }
    }
}
