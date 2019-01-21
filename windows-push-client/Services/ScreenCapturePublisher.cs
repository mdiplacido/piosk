namespace windows_push_client.Services
{
    using System;
    using windows_push_client.Models;

    public class ScreenCapturePublisher : IPublisherService
    {
        private readonly DiskPublisherService disk;
        private readonly SFTPPublisherService sftp;
        private readonly ILoggingService logger;

        public bool EnableDiskPublishing
        {
            get; set;
        }

        public bool EnableFtpPublishing
        {
            get; set;
        }

        public ScreenCapturePublisher(DiskPublisherService disk, SFTPPublisherService sftp, ILoggingService logger)
        {
            this.logger = logger.ScopeForFeature(this.GetType());
            this.disk = disk;
            this.sftp = sftp;
        }


        // TODO: we should have an enqueue which writes the image to disk for publishing.
        // and a disk watcher that then enqueues and gets the connection and performs the publishing off
        // of the UI thread.  This will allow capture to write to a share and a separate instance on another 
        // machine doing the publishing.
        public void Send(PNGXPayload pngPayload, string fileName, PublishCompleteHandler complete)
        {
            var completionCount = 2;
            PublishCompletionStatus status = PublishCompletionStatus.None;

            var startTime = DateTime.UtcNow;

            void decrementAndTrySendCompletion(PublishCompletionStatus s, string message)
            {
                this.logger.Verbose(message);

                status = s == PublishCompletionStatus.Failure || status == PublishCompletionStatus.Failure ?
                    PublishCompletionStatus.Failure :
                    s != PublishCompletionStatus.None ?
                        s :
                        status;

                if (--completionCount < 1)
                {
                    var elapsedTime = DateTime.UtcNow - startTime;
                    var totalMbBytesSent = ((double)pngPayload.Data.Length / (1024 * 1024)).ToString("0.###");
                    complete(status, $"Final publish status is {status}, time elapsed: {elapsedTime.TotalSeconds} seconds, image size {totalMbBytesSent}Mb, last message: {message}");
                }
            }

            void safeDecrementAndTrySendCompletion(PublishCompletionStatus s, string message)
            {
                // the underlying publishers can execute completion on threads other than the compute bound UI thread.
                // to be safe we always dispatch back to the UI thread.
                App.Current.Dispatcher.Invoke(() => decrementAndTrySendCompletion(s, message));
            }

            if (this.EnableDiskPublishing)
            {
                this.disk.Send(
                    pngPayload,
                    fileName,
                    (s, message) => safeDecrementAndTrySendCompletion(s, $"Completed writing file: {fileName}, status: {s}, message: {message}"));
            }
            else
            {
                decrementAndTrySendCompletion(PublishCompletionStatus.None, "decrementing logger completion count, disk publishing is disabled");
            }

            if (this.EnableFtpPublishing)
            {
                this.sftp.Send(
                    pngPayload,
                    fileName,
                    (s, message) => safeDecrementAndTrySendCompletion(s, $"Completed sending ${fileName} over SFTP, status: {s}, message: {message}"));
            }
            else
            {
                decrementAndTrySendCompletion(PublishCompletionStatus.None, "decrementing logger completion count, ftp publishing is disabled");
            }
        }
    }
}
