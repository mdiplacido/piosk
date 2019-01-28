namespace windows_push_client.Utility
{
    using System;
    using System.Windows.Threading;

    public static class TimerUtility
    {
        public static void RunSafeDelayedAction(Action code, TimeSpan delay, Action<Exception> errorHandler)
        {
            RunDelayedActionImpl(code, delay, errorHandler);
        }

        public static void RunDelayedAction(Action code, TimeSpan delay)
        {
            RunDelayedActionImpl(code, delay, ex => throw ex);
        }

        private static void RunDelayedActionImpl(Action code, TimeSpan delay, Action<Exception> errorHandler)
        {
            // we introduce an artificial delay before processing the capture.
            // this is dumb, there's no definitive way to know if the page has "settled".
            var timer = new DispatcherTimer { Interval = delay };

            timer.Tick += (s, args) =>
            {
                timer.Stop();

                try
                {
                    code();
                }
                catch (Exception ex)
                {
                    errorHandler(ex);
                }
            };

            timer.Start();
        }
    }
}
