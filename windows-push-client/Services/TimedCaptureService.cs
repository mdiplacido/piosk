namespace windows_push_client.Services
{
    using System;
    using System.Collections.Concurrent;
    using System.Collections.Generic;
    using System.Linq;
    using System.Windows.Threading;
    using windows_push_client.Utility;

    public class TimedCaptureService
    {
        private readonly DispatcherTimer timer = new DispatcherTimer();
        private readonly ILoggingService logger;
        private readonly ConcurrentQueue<ScreenCapturePanel> panelCaptureQueue = new ConcurrentQueue<ScreenCapturePanel>();
        private ScreenCapturePanel currentCapture;

        private ScreenCapturePanel[] panelsToCapture = new ScreenCapturePanel[0];

        public event Action NotifyPanelProcessingCompleteHandler;

        public bool IsEnabled
        {
            get
            {
                return this.timer.IsEnabled;
            }
        }

        public bool IsRecycleNeeded()
        {
            return this.panelsToCapture.Any(p => p.NeedsRecycling());
        }

        public void ResetAllPanelCounters()
        {
            // there can be a race when we are recycling panels where a completion screen-shot thread
            // can trigger back to back recycles (even though we may have just recreated the panel).
            // this method clears all capture service watched panel counters
            this.panelsToCapture.ToList().ForEach(p => p.ResetState());
        }

        public TimedCaptureService(ILoggingService logger)
        {
            this.timer.Tick += CapturePanels_Tick;
            this.logger = logger.ScopeForFeature(this);
            this.logger.Info("current timer IsEnabled '{0}'", this.timer.IsEnabled);
        }

        public void ForceStop()
        {
            if (this.IsEnabled)
            {
                this.Toggle();
            }
        }

        public void NotifyPanelProcessingComplete(ScreenCapturePanel panel)
        {
            this.logger.Info("Receiving completion notification from panel: {0}", panel.Config.PrettyName);

            if (this.currentCapture == panel)
            {
                this.currentCapture = null;
            }

            this.NotifyPanelProcessingCompleteHandler?.Invoke();
       
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

            // it's possible that old panels were in the queue but were removed during a recycle, we'll
            // add the new versions back into the queue.  the ControllerService can be a caller to SetPanels which
            // is how we would get in this state where the queue had old panels in it.
            var queueSnapshot = this.panelCaptureQueue.ToList();

            this.panelCaptureQueue.Clear();

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

            if (queueSnapshot.Any())
            {
                this.logger.Warn("There were items in the queue while SetPanels was being called.  Will enqueue new panels for these items");
                queueSnapshot.ForEach(oldPanel =>
                {
                    // probably not the most accurate way to do this, we could also just check the config pointer.
                    // the assumption here is that the new panel list will always have a match for an old queued item
                    // if we do not find a match then that queued item will not get run as we have already cleared it from
                    // the queue.
                    var match = this.panelsToCapture.FirstOrDefault(p => p.Config.Name == oldPanel.Config.Name);

                    if (match != null)
                    {
                        logger.Info($"Enqueuing new panel replacement for existing queue item: '{oldPanel.Config.PrettyName}'");
                        this.panelCaptureQueue.Enqueue(match);
                    }
                    else
                    {
                        this.logger.Warn($"Cannot find new panel for old panel in queue with name '{oldPanel.Config.PrettyName}, old queued item has been dropped'");
                    }
                });
            }

            // there could be something processing and now that panel has gone away.  lets just clear the current processing
            // panel prop
            if (this.currentCapture != null && 
                this.panelsToCapture.FirstOrDefault(p => p == this.currentCapture) == null)
            {
                // it's possible with the recycle panels caller we could get into this state.
                // if the user is adding a new panel then we shuldn't get here.
                this.logger.Warn("clearing currentCapture, there is no matching panel after set panels");  
                this.currentCapture = null;
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
