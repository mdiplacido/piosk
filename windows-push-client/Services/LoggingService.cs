namespace windows_push_client.Services
{
    using NLog;
    using System;
    using System.Reactive.Linq;
    using System.Reactive.Subjects;
    using windows_push_client.Models;

    public interface ILoggingService
    {
        IObservable<string> Events { get; }
        void Verbose(string message, params object[] args);
        void Error(string message, params object[] args);
        void Warn(string message, params object[] args);
        void Info(string message, params object[] args);
        ILoggingService ScopeForFeature(object featureThing);
    }

    public class ScopedLoggingService : ILoggingService
    {
        private readonly LoggingService logger;
        private readonly string feature;

        public ScopedLoggingService(LoggingService logger, string feature = "Main")
        {
            this.logger = logger;
            this.feature = feature;
        }

        public IObservable<string> Events
        {
            get
            {
                return this.logger.Events;
            }
        }

        public ILoggingService ScopeForFeature(object featureThing)
        {
            return this.logger.ScopeForFeature(featureThing.GetType().Name);
        }

        public void Error(string message, params object[] args)
        {
            this.logger.AddMessage(this.MakeFormattedMessage("Error", 1, message, args));
        }

        public void Info(string message, params object[] args)
        {
            this.logger.AddMessage(this.MakeFormattedMessage("Info", 2, message, args));
        }

        public void Verbose(string message, params object[] args)
        {
            this.logger.AddMessage(this.MakeFormattedMessage("Verbose", 1, message, args));
        }

        public void Warn(string message, params object[] args)
        {
            this.logger.AddMessage(this.MakeFormattedMessage("Warn", 2, message, args));
        }

        private string MakeFormattedMessage(string type, int typeSpacing, string message, params object[] args)
        {
            var formattedMessage = string.Format(message, args);
            var spacing = new String('\t', typeSpacing);
            var logSuffix = string.Format("[{0}][{1}]{2}[{3}] - ", DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss.ffff"), type, spacing, this.feature);
            return logSuffix + formattedMessage;
        }
    }

    public class LoggingService
    {
        private readonly ReplaySubject<string> events = new ReplaySubject<string>(100);
        private readonly Logger diskLogger;
        private readonly Config config;

        public LoggingService(Config config)
        {
            this.config = config;
            this.diskLogger = this.SetupNLog();
        }

        public IObservable<string> Events
        {
            get
            {
                return this.events.AsObservable();
            }
        }

        public ILoggingService ScopeForFeature(string feature)
        {
            return new ScopedLoggingService(this, feature);
        }

        public void AddMessage(string message)
        {
            this.diskLogger.Trace(message);
            this.events.OnNext(message);
        }

        private Logger SetupNLog()
        {
            var config = new NLog.Config.LoggingConfiguration();
            var logfile = new NLog.Targets.FileTarget("piosk-push-client")
            {
                FileName = "./piosk-push-client.log",
                ArchiveAboveSize = this.config.MaxLogFileSizeBytes,
                MaxArchiveFiles = 3
            };
            config.AddRuleForAllLevels(logfile);
            NLog.LogManager.Configuration = config;

            // NLog is our way to learn about application crashes as well
            var logger = LogManager.GetCurrentClassLogger();

            AppDomain.CurrentDomain.UnhandledException +=
                (object sender, UnhandledExceptionEventArgs eArg) =>
                    {
                        logger.Error(eArg.ExceptionObject?.ToString());
                        LogManager.Flush();
                        LogManager.Shutdown();
                    };

            return logger;
        }
    }
}
