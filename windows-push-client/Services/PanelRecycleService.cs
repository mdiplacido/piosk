namespace windows_push_client.Services
{
    using System;
    using System.Linq;
    using windows_push_client.Utility;

    public class PanelRecylceService
    {
        private readonly TimedCaptureService captureService;
        private readonly ILoggingService logger;
        private readonly MainWindow window;
        private bool isExecuting = false;

        public PanelRecylceService(MainWindow window, TimedCaptureService captureService, ILoggingService logging)
        {
            this.window = window;
            this.logger = logging.ScopeForFeature(this);
            this.captureService = captureService;
            this.captureService.NotifyPanelProcessingCompleteHandler += CaptureService_NotifyPanelProcessingCompleteHandler;
        }

        public void Execute()
        {
            if (this.isExecuting || !this.captureService.IsRecycleNeeded())
            {
                return;
            }

            this.isExecuting = true;
            TimerUtility.RunSafeDelayedAction(() =>
            {
                this.ExecuteUnsafe();
                this.isExecuting = false;
            },
            TimeSpan.FromMilliseconds(500),
            (error) =>
            {
                this.isExecuting = false;
                this.logger.Error("Got fatal error during Panel recycle {0}", error.ToString());
            });
        }

        private void ExecuteUnsafe()
        {
            // first we pause the capture service
            var wasCapturing = this.captureService.IsEnabled;
            this.captureService.ForceStop();

            // we reset the counters so that any new completion threads that come in will not trigger
            // a recycle.
            this.captureService.ResetAllPanelCounters();

            this.RecyclePanels();

            // then we run a GC
            GC.Collect(2, GCCollectionMode.Forced, blocking: false);

            // restart the queue processing.
            if (wasCapturing && !this.captureService.IsEnabled)
            {
                this.captureService.Toggle();
            }
        }

        private void CaptureService_NotifyPanelProcessingCompleteHandler()
        {
            // we check to see if any panels need to be recycled.
            if (!this.captureService.IsRecycleNeeded())
            {
                this.logger.Info("Nothing to recycle...");
                return;
            }

            this.Execute();
        }

        private void RecyclePanels()
        {
            this.logger.Info("Starting panel recycling");

            var configs = this.window.FindAllCapturePanels().Select(p => p.Config).ToList();

            // we reverse the configs because CreateCapturePanelsFromConfigs performs an insert
            // at position 0, so we want are last tab first to maintain the same visual tab order.
            configs.Reverse();

            this.window.ClearExistingCapturePanels();
            this.window.CreateCapturePanelsFromConfigs(configs);
            this.window.UpdateCaptureServiceWithPanels();

            this.logger.Info("Finished panel recycling");
        }
    }
}
