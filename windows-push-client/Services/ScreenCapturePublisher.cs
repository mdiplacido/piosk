

namespace windows_push_client.Services
{
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
            this.logger = logger.ScopeForFeature("ScreenCapturePublisher");
            this.disk = disk;
            this.sftp = sftp;
        }

        public void Send(byte[] data, string fileName, PublishCompleteHandler complete)
        {
            var completionCount = 2;
            PublishCompletionStatus status = PublishCompletionStatus.None;

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
                    complete(status, $"Final publish status is {status}, last message: {message}");
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
                    data,
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
                    data,
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
