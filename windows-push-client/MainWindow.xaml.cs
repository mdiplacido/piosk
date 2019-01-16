namespace windows_push_client
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Windows;
    using System.Windows.Controls;
    using windows_push_client.Models;
    using windows_push_client.Services;

    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class MainWindow : Window
    {
        private readonly LoggingService loggingService = new LoggingService();
        private ILoggingService featureLogger;
        private TimedCaptureService timedCaptureService;
        private ScreenCapturePublisher capturePublisher;
        private LogView logView;
        private Config config;

        public MainWindow()
        {
            this.config = Config.Load();
            this.featureLogger = this.loggingService.ScopeForFeature("MainWindow");
            this.featureLogger.Info("Log Config {0}", this.config.ToString());

            InitializeComponent();

            this.logView = new LogView(this.loggingService);

            this.capturePublisher = new ScreenCapturePublisher(
                new DiskPublisherService(this.config),
                new SFTPPublisherService(new SFTPClientFactory(this.config), this.config, this.featureLogger),
                this.featureLogger
            )
            {
                EnableFtpPublishing = this.config.EnablePublishToSFTP,
                EnableDiskPublishing = this.config.EnablePublishToDisk
            };

            this.CreateCapturePanels();
            this.KeyDown += this.MainWindow_KeyDown;
        }


        private void MainWindow_KeyDown(object sender, System.Windows.Input.KeyEventArgs e)
        {
            if (e.Key == System.Windows.Input.Key.F11)
            {
                this.PauseResumeButton_Click(sender, e);
            }
        }

        private void CreateCapturePanels()
        {
            this.featureLogger.Info("CreateCapturePanels initializing...");

            // hook the screen capture with our function
            (this.AddScreenCaptureComponent as AddScreenCapture).SetSaveHandler(this.AddNewUserCreatedCapturePanel);

            // add the log viewer 
            this.screenCapturePanels.Items.Insert(0, new TabItem()
            {
                Header = "Log View",
                Content = this.logView,
            });

            // we do not start the timer until the user decides to do so
            this.timedCaptureService = new TimedCaptureService(this.featureLogger);

            this.LoadCapturePanelConfigData()
                .Select(config => new ScreenCapturePanel(
                    config,
                    this.featureLogger,
                    this.timedCaptureService,
                    this.capturePublisher,
                    this.HandleCapturePanelFocusRequest)
                )
                .Select(panel => new TabItem()
                {
                    Content = panel,
                    Header = panel.Config.Name
                })
                .ToList()
                .ForEach(tab =>
                {
                    this.screenCapturePanels.Items.Insert(0, tab);
                });

            this.featureLogger.Info("CreateCapturePanels initializing complete");
            this.UpdateCaptureServiceWithPanels();
        }

        private List<ScreenCapturePanelConfig> LoadCapturePanelConfigData()
        {
            return new List<ScreenCapturePanelConfig>()
            {
                new ScreenCapturePanelConfig() { Url = "https://onlineclock.net/", Name = "Online Clock", Interval = TimeSpan.FromSeconds(5) },
                new ScreenCapturePanelConfig() { Url = "http://www.clocktab.com/", Name = "Clock Tab", Interval = TimeSpan.FromSeconds(5) },
            };
        }

        private void AddNewUserCreatedCapturePanel(ScreenCapturePanelConfig config)
        {
            var panel = new ScreenCapturePanel(
                config,
                this.featureLogger,
                this.timedCaptureService,
                this.capturePublisher,
                this.HandleCapturePanelFocusRequest);

            var tab = new TabItem()
            {
                Content = panel,
                Header = panel.Config.Name
            };

            this.screenCapturePanels.Items.Insert(0, tab);
            this.screenCapturePanels.SelectedIndex = 0;

            this.featureLogger.Info("Added new Capture Panel named {0}", panel.Config.PrettyName);

            this.UpdateCaptureServiceWithPanels();
        }

        private void UpdateCaptureServiceWithPanels()
        {
            var panels = this.screenCapturePanels.Items
                .Cast<TabItem>()
                .Select(tab => tab.Content as ScreenCapturePanel)
                .Where(panel => panel != null)  // not all tabs are ScreenCapturePanel's
                .ToArray();

            this.timedCaptureService.SetPanels(panels);
        }

        private void PauseResumeButton_Click(object sender, RoutedEventArgs e)
        {
            if (!this.timedCaptureService.CanToggle())
            {
                MessageBox.Show("Cannot toggle capture.  See Log tab for more details.", "Cannot Toggle!", MessageBoxButton.OK, MessageBoxImage.Error);
                return;
            }

            this.timedCaptureService.Toggle();

            this.PauseResumeButton.Content = this.timedCaptureService.IsEnabled ? "Stop" : "Start";
        }

        private void HandleCapturePanelFocusRequest(ScreenCapturePanel panel)
        {
            var match = this.screenCapturePanels.Items
                .Cast<TabItem>()
                .Select((t, i) => new { Index = i, Tab = t })
                .FirstOrDefault(t => t.Tab.Content == panel);

            if (match == null)
            {
                throw new ApplicationException(string.Format("Unexpected state! Not able to find panel {0}", panel.Config.PrettyName));
            }

            this.screenCapturePanels.SelectedIndex = match.Index;
        }
    }
}
