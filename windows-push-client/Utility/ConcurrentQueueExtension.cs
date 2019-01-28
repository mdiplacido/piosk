
namespace windows_push_client.Utility
{
    using System.Collections.Concurrent;

    public static class ConcurrentQueue
    {
        public static void Clear<T>(this ConcurrentQueue<T> queue)
        {
            while(!queue.IsEmpty)
            {
                queue.TryDequeue(out T temp);
            }
        }
    }
}
