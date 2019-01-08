namespace windows_push_client.Services
{
    public enum PublishCompletionStatus
    {
        None = 0,
        Success = 1,
        Failure = 2
    }

    public delegate void PublishCompleteHandler(PublishCompletionStatus status, string message);

    public interface IPublisherService
    {
        void Send(byte[] data, string fileName, PublishCompleteHandler complete);
    }
}   