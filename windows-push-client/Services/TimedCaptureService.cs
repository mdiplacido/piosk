namespace windows_push_client.Services
{
    using System;
    using System.Collections.Concurrent;
    using System.Collections.Generic;
    using System.Linq;
    using System.Windows.Threading;

    public class TimedCaptureService
    {
        private readonly DispatcherTimer timer = new DispatcherTimer();
        private readonly ILoggingService logger;
        private readonly ConcurrentQueue<ScreenCapturePanel> panelCaptureQueue = new ConcurrentQueue<ScreenCapturePanel>();
        private ScreenCapturePanel currentCapture;

        private ScreenCapturePanel[] panelsToCapture = new ScreenCapturePanel[0];

        public bool IsEnabled
        {
            get
            {
                return this.timer.IsEnabled;
            }
        }

        public TimedCaptureService(ILoggingService logger)
        {
            this.timer.Tick += CapturePanels_Tick;
            this.logger = logger.ScopeForFeature(this.GetType());
            this.logger.Info("current timer IsEnabled '{0}'", this.timer.IsEnabled);
        }

        public void NotifyPanelProcessingComplete(ScreenCapturePanel panel)
        {
            this.logger.Info("Receiving completion notification from panel: {0}", panel.Config.PrettyName);
            this.currentCapture = null;
            this.ProcessPanelQueue();
        }

        private void CapturePanels_Tick(object sender, System.EventArgs e)
        {
            this.logger.Verbose("CapturePanels_Tick...");

            if (this.panelCaptureQueue.Any())
            {
                this.logger.Warn("Skipping this interval, there are panels currently being processed in the queue");
                return;
            }

            this.ProcessPanelQueue();
            this.logger.Verbose("exiting CapturePanels_Tick");
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
                this.logger.Warn("TimedCaptureService: timer interval set to Zero, stopping timer");
                this.timer.Stop();
            }

            this.LogInfo();
        }

        public void Toggle()
        {
            // we can always toggle the timer off, but we can only toggle on if we are using an interval that is not zero
            if (this.CanToggle())
            {
                var isEnabled = !this.timer.IsEnabled;

                // user explicitly toggled the panels, but a capture may need to run now if something is due
                // we will force a run in this case.
                // order matters. we kick off the forced run first which will fill the queue and we then let the timer
                // start if we are in the enabled mode.  
                if (isEnabled && this.PanelsDue().Any())
                {
                    this.logger.Verbose("Forcing run of queue processing, panels are due after toggle!");
                    this.ProcessPanelQueue();
                }

                this.timer.IsEnabled = isEnabled;
            }

            this.LogInfo();
        }

        public bool CanToggle()
        {
            return this.timer.Interval != TimeSpan.Zero || this.timer.IsEnabled;
        }

        private void LogInfo()
        {
            var message = string.Format("timer IsEnabled {0}", this.timer.IsEnabled ? "Running" : "Paused") + " | "
                + string.Format("timer Interval: {0}", this.timer.Interval) + " | "
                + string.Format("panel count: {0}", this.panelsToCapture.Count()) + " | "
                + string.Format("queue count: {0}", this.panelCaptureQueue.Count());

            this.logger.Info(message);
        }

        private List<ScreenCapturePanel> PanelsDue()
        {
            // we have NEW work to do if a panel is due and not currently processing or in the queue
            // (it could be processing because the user is doing a manual run)
            return this.panelsToCapture
                .Where(p => !p.Config.LastCapture.HasValue || DateTime.UtcNow >= (p.Config.LastCapture + p.Config.Interval))
                .Where(p => !p.IsCaptureInProgress)
                .Where(p => p != this.currentCapture)
                .Where(p => !this.panelCaptureQueue.Contains(p))
                .ToList();
        }

        private void ProcessPanelQueue()
        {
            this.logger.Verbose("In ProcessPanelQueue...");

            this.LogInfo();

            // sanity check: it's possible that the timer has been paused.  we will short circuit here.
            if (!this.timer.IsEnabled)
            {
                this.logger.Info("Timer is paused, exiting ProcessPanelQueue");
                return;
            }

            // pickup and new panels and add them to the queue.
            // only add panels not already in the queue
            this.PanelsDue().ForEach(p => this.panelCaptureQueue.Enqueue(p));

            if (!this.panelCaptureQueue.Any())
            {
                this.logger.Verbose("ProcessPanelQueue - No panels to process.");
                return;
            }

            if (this.currentCapture != null)
            {
                this.logger.Warn("Cannot Process more queue items, currently waiting on {0}", this.currentCapture.Config.PrettyName);
                return;
            }

            this.logger.Info("Processing {0} panels", this.panelCaptureQueue.Count());

            // take the first item and begin processing that, we will chain the processing
            // when this panel completes or fails we will receive notification and will move
            // on to the next panel.

            // NOTE: why we chain - we need to serialize these due to the way we take the screen-shot.
            // currently I don't have a way to ask the WebView to capture itself, I need
            // to actually capture the screen.  This has it's drawbacks as any other app windows
            // overlay-ed on top of our WebView will be captured.
            if (this.panelCaptureQueue.TryDequeue(out ScreenCapturePanel nextPanel))
            {
                this.logger.Info("Dequeued {0}", nextPanel.Config.PrettyName);

                // we use the current capture as a sanity check to ensure we don't process this again
                // in addition to checking if the panel itself thinks it is capturing.
                this.currentCapture = nextPanel;

                // panels will call back to this ProcessPanelQueue when they are done processing work.
                // this will allow the queue to continue to drain.
                // this is an async operation...
                nextPanel.CaptureScreen(this);
            }

            this.LogInfo();

            this.logger.Info("Exiting ProcessPanelQueue.");
        }
    }
}
