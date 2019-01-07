namespace windows_push_client.Utility
{
    using System;
    using System.Windows.Threading;

    public static class TimerUtility
    {
        public static void RunDelayedAction(Action code, TimeSpan delay)
        {
            // we introduce an artificial delay before processing the capture.
            // this is dumb, there's no definitive way to know if the page has "settled".
            var timer = new DispatcherTimer { Interval = delay };

            timer.Tick += (s, args) =>
            {
                timer.Stop();
                code();
            };

            timer.Start();
        }
    }
}
