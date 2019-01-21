namespace windows_push_client
{
    using Newtonsoft.Json;
    using System;
    using System.Collections.Generic;
    using System.IO;
    using System.Linq;
    using System.Text.RegularExpressions;
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
        private readonly SecretService secrets = new SecretService();

        private ILoggingService featureLogger;
        private TimedCaptureService timedCaptureService;
        private ScreenCapturePublisher capturePublisher;
        private LogView logView;
        private Config config;
        private ScreenCapturePanel currentCapturePanel;
        private readonly Object visibilitySync = new Object();

        public MainWindow()
        {
            this.config = Config.Load();
            this.featureLogger = this.loggingService.ScopeForFeature("MainWindow");
            this.featureLogger.Info("Log Config {0}", this.config.ToString());

            InitializeComponent();

            this.logView = new LogView(this.loggingService);

            this.capturePublisher = new ScreenCapturePublisher(
                new DiskPublisherService(this.config),
                new SFTPPublisherService(new SFTPClientFactory(this.config, this.secrets), this.config, this.featureLogger),
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
                .Select(captureConfig => new ScreenCapturePanel(
                    this.config,
                    captureConfig,
                    this.featureLogger,
                    this.timedCaptureService,
                    this.capturePublisher,
                    this.HandleCapturePanelFocusRequest,
                    this.HandleCapturePanelReleaseFocusRequest)
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
            var fullPathToConfig = this.GetAndEnsureFullPathToConfig();

            this.featureLogger.Verbose($"Attempting to load configuration from '{fullPathToConfig}'");

            if (!File.Exists(fullPathToConfig))
            {
                this.featureLogger.Info("No configuration found, please create new capture configuration");
                return new List<ScreenCapturePanelConfig>();
            }

            try
            {
                var config = File.ReadAllText(fullPathToConfig);
                return JsonConvert.DeserializeObject<List<ScreenCapturePanelConfig>>(config);
            }
            catch (Exception ex)
            {
                this.featureLogger.Error($"Got error '{ex.ToString()}' attempting to load configuration");
                return new List<ScreenCapturePanelConfig>();
            }
        }

        private void AddNewUserCreatedCapturePanel(ScreenCapturePanelConfig config)
        {
            var panel = new ScreenCapturePanel(
                this.config,
                config,
                this.featureLogger,
                this.timedCaptureService,
                this.capturePublisher,
                this.HandleCapturePanelFocusRequest,
                this.HandleCapturePanelReleaseFocusRequest);

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
            var panels = this.FindAllCapturePanels().ToArray();
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

        private bool HandleCapturePanelFocusRequest(ScreenCapturePanel panel)
        {
            lock(visibilitySync)
            {
                if (this.currentCapturePanel != null && this.currentCapturePanel != panel)
                {
                    return false;
                }

                this.currentCapturePanel = panel;

                var match = this.screenCapturePanels.Items
                    .Cast<TabItem>()
                    .Select((t, i) => new { Index = i, Tab = t })
                    .FirstOrDefault(t => t.Tab.Content == panel);

                if (match == null)
                {
                    throw new ApplicationException(string.Format("Unexpected state! Not able to find panel {0}", panel.Config.PrettyName));
                }

                this.screenCapturePanels.SelectedIndex = match.Index;

                return true;
            }
        }

        private void HandleCapturePanelReleaseFocusRequest(ScreenCapturePanel panel)
        {
            lock (visibilitySync)
            {
                if (this.currentCapturePanel == panel)
                {
                    this.currentCapturePanel = null;
                }
            }
        }

        private IEnumerable<ScreenCapturePanel> FindAllCapturePanels()
        {
            return this.screenCapturePanels.Items
                .Cast<TabItem>()
                .Select(tab => tab.Content as ScreenCapturePanel)
                .Where(panel => panel != null);  // not all tabs are ScreenCapturePanel's
        }

        private void SaveAllButton_Click(object sender, RoutedEventArgs e)
        {
            // get info from all the panels and serialize and save to disk.
            var panelConfigs = this.FindAllCapturePanels().Select(panel => panel.Config).ToArray();
            var fullPath = this.GetAndEnsureFullPathToConfig();
            this.featureLogger.Info($"Writing screen capture configuration to ${fullPath}");

            using (StreamWriter file = File.CreateText(fullPath))
            {
                JsonSerializer serializer = new JsonSerializer();
                serializer.Serialize(file, panelConfigs);
            }

            MessageBox.Show(this, "All capture configurations have been saved", "Configuration Saved", MessageBoxButton.OK, MessageBoxImage.Information);
        }

        private string GetAndEnsureFullPathToConfig() {
            var directory = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "PioskPushClient");
            var fullPath = Path.Combine(directory, "Config.json");

            if (!Directory.Exists(directory))
            {
                Directory.CreateDirectory(directory);
            }

            return fullPath;
        }

        private void SFTPPasswordSaveButton_Click(object sender, RoutedEventArgs e)
        {
            this.secrets.SetSecret(this.config.SFTPUsername, this.SFTPPassword.Password);
            MessageBox.Show(this, "The password has been saved", "Password Saved", MessageBoxButton.OK, MessageBoxImage.Information);
        }

        private void SFTPPassword_PasswordChanged(object sender, RoutedEventArgs e)
        {
            var strongRe = new Regex("^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})");
            this.SavePasswordButton.IsEnabled = strongRe.IsMatch(this.SFTPPassword.Password);            
        }
    }
}
