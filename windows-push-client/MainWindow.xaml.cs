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
        private TimedCaptureService timedCaptureService;

        public MainWindow()
        {
            InitializeComponent();
            this.CreateCapturePanels();
        }

        private void CreateCapturePanels()
        {
            this.loggingService.Add("CreateCapturePanels initializing...");

            // hook the screen capture with our function
            (this.AddScreenCaptureComponent as AddScreenCapture).SetSaveHandler(this.AddNewUserCreatedCapturePanel);

            // add the log viewer 
            this.screenCapturePanels.Items.Insert(0, new TabItem()
            {
                Header = "Log View",
                Content = new LogView(this.loggingService),
            });

            this.LoadCapturePanelConfigData()
                .Select(config => new ScreenCapturePanel(config))
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

            this.loggingService.Add("CreateCapturePanels initializing complete");

            // we do not start the timer until the user decides to do so
            this.timedCaptureService = new TimedCaptureService(loggingService);
            this.UpdateCaptureServiceWithPanels();
        }

        private List<ScreenCapturePanelConfig> LoadCapturePanelConfigData()
        {
            return new List<ScreenCapturePanelConfig>()
            {
                new ScreenCapturePanelConfig() { Url = "https://www.bing.com/", Name = "Bing Search", Interval = TimeSpan.FromSeconds(5) },
                new ScreenCapturePanelConfig() { Url = "https://www.google.com/", Name = "Google Search", Interval = TimeSpan.FromSeconds(2) },
            };
        }

        private void AddNewUserCreatedCapturePanel(ScreenCapturePanelConfig config)
        {
            var panel = new ScreenCapturePanel(config);
            var tab = new TabItem()
            {
                Content = panel,
                Header = panel.Config.Name
            };

            this.screenCapturePanels.Items.Insert(0, tab);
            this.screenCapturePanels.SelectedIndex = 0;

            this.loggingService.Add(string.Format("Added new Capture Panel named \"{0}\"", panel.Config.Name));

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
    }
}
