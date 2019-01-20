namespace windows_push_client.Services
{
    using windows_push_client.Models;

    public enum PublishCompletionStatus
    {
        None = 0,
        Success = 1,
        Failure = 2
    }

    public delegate void PublishCompleteHandler(PublishCompletionStatus status, string message);

    public interface IPublisherService
    {
        void Send(PNGXPayload payload, string fileName, PublishCompleteHandler complete);
    }
}   