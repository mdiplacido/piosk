namespace windows_push_client.Services
{
    using NLog;
    using System;
    using System.Reactive.Linq;
    using System.Reactive.Subjects;

    public interface ILoggingService
    {
        IObservable<string> Events { get; }
        void Verbose(string message, params object[] args);
        void Error(string message, params object[] args);
        void Warn(string message, params object[] args);
        void Info(string message, params object[] args);
        ILoggingService ScopeForFeature(string feature);
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

        public ILoggingService ScopeForFeature(string feature)
        {
            return this.logger.ScopeForFeature(feature);
        }

        public void Error(string message, params object[] args)
        {
            this.logger.AddMessage(this.MakeFormattedMessage("E", message, args));
        }

        public void Info(string message, params object[] args)
        {
            this.logger.AddMessage(this.MakeFormattedMessage("I", message, args));
        }

        public void Verbose(string message, params object[] args)
        {
            this.logger.AddMessage(this.MakeFormattedMessage("V", message, args));
        }

        public void Warn(string message, params object[] args)
        {
            this.logger.AddMessage(this.MakeFormattedMessage("W", message, args));
        }

        private string MakeFormattedMessage(string type, string message, params object[] args)
        {
            var formattedMessage = string.Format(message, args);
            var logSuffix = string.Format("[{0}][{1}] - ", type, this.feature);
            return logSuffix + formattedMessage;
        }
    }

    public class LoggingService
    {
        private readonly ReplaySubject<string> events = new ReplaySubject<string>(100);
        private readonly Logger diskLogger;

        public LoggingService()
        {
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
            var logfile = new NLog.Targets.FileTarget("piosk-push-client") { FileName = "./piosk-push-client.log" };
            config.AddRuleForAllLevels(logfile);
            NLog.LogManager.Configuration = config;
            return LogManager.GetCurrentClassLogger();
        }
    }
}
