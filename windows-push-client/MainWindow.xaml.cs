namespace windows_push_client
{
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
        }

        private List<ScreenCapturePanelConfig> LoadCapturePanelConfigData()
        {
            return new List<ScreenCapturePanelConfig>()
            {
                new ScreenCapturePanelConfig() { Url = "https://www.bing.com/", Name = "Bing Search" },
                new ScreenCapturePanelConfig() { Url = "https://www.google.com/", Name = "Google Search" },
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
        }
    }
}
