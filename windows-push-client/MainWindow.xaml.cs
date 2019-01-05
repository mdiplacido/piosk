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

            this.screenCapturePanels.Items.Clear();

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
                    this.screenCapturePanels.Items.Add(tab);
                });

            // add the log viewer 
            this.screenCapturePanels.Items.Add(new TabItem()
            {
                Header = "Log View",
                Content = new LogView(this.loggingService),
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
    }
}
