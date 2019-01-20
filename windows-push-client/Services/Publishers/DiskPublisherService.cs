namespace windows_push_client.Services
{
    using System;
    using System.IO;
    using windows_push_client.Models;

    public class DiskPublisherService : IPublisherService
    {
        // eg. \var\jail\data\piosk_pickup\{0}.pngx
        private readonly Config config;

        public DiskPublisherService(Config config)
        {
            this.config = config;
        }

        public void Send(PNGXPayload payload, string fileName, PublishCompleteHandler complete)
        {
            if (complete == null)
            {
                throw new ArgumentNullException(nameof(complete));
            }

            var fullPath = Path.Combine(this.config.DiskPath, fileName);

            try
            {
                File.WriteAllBytes(fullPath, payload.Serialize());
                complete(PublishCompletionStatus.Success, $"Completed writing file {fileName} with success");
            }
            catch (System.IO.IOException ex)
            {
                complete(PublishCompletionStatus.Failure, $"failed writing file {fileName} got error {ex.ToString()}");
            }
        }
    }
}
