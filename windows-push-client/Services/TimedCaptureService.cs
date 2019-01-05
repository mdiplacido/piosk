namespace windows_push_client.Services
{
    using System;
    using System.Linq;
    using System.Windows.Threading;

    public class TimedCaptureService
    {
        private readonly DispatcherTimer timer = new DispatcherTimer();
        private readonly LoggingService logger;

        private ScreenCapturePanel[] panelsToCapture = new ScreenCapturePanel[0];

        public bool IsEnabled
        {
            get
            {
                return this.timer.IsEnabled;
            }
        }

        public TimedCaptureService(LoggingService logger)
        {
            this.timer.Tick += CapturePanels_Tick;
            this.logger = logger;
            this.logger.Add(string.Format("TimedCaptureService: current timer IsEnabled '{0}'", this.timer.IsEnabled));
        }

        private void CapturePanels_Tick(object sender, System.EventArgs e)
        {
            this.logger.Add("TimedCaptureService: in CapturePanels_Tick...");
            this.logger.Add("TimedCaptureService: exiting CapturePanels_Tick");
        }

        public void SetPanels(ScreenCapturePanel[] panels)
        {
            this.panelsToCapture = panels;

            // compute the min interval
            var minimumInterval = this.panelsToCapture
                .Select(panel => panel.Config.Interval)
                .DefaultIfEmpty(TimeSpan.Zero)
                .Min();

            this.timer.Interval = minimumInterval;

            if (minimumInterval == TimeSpan.Zero)
            {
                this.logger.Add("TimedCaptureService: timer interval set to Zero, stopping timer");
                this.timer.Stop();
            }

            this.LogTimerInfo();
        }

        public void Toggle()
        {
            // we can always toggle the timer off, but we can only toggle on if we are using an interval that is not zero
            if (this.CanToggle())
            {
                this.timer.IsEnabled = !this.timer.IsEnabled;
            }

            this.LogTimerInfo();
        }

        public bool CanToggle()
        {
            return this.timer.Interval != TimeSpan.Zero || this.timer.IsEnabled;
        }

        private void LogTimerInfo()
        {
            this.logger.Add(string.Format("TimedCaptureService: timer IsEnabled {0}", this.timer.IsEnabled ? "Running" : "Paused"));
            this.logger.Add(string.Format("TimedCaptureService: timer Interval: {0}", this.timer.Interval));
            this.logger.Add(string.Format("TimedCaptureService: panel count: {0}", this.panelsToCapture.Count()));
        }
    }
}
