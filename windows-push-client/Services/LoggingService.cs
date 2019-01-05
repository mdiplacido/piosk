namespace windows_push_client.Services
{
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
            this.logger.AddMessage(this.MakeFormattedMessage("Error", message, args));
        }

        public void Info(string message, params object[] args)
        {
            this.logger.AddMessage(this.MakeFormattedMessage("Info", message, args));
        }

        public void Verbose(string message, params object[] args)
        {
            this.logger.AddMessage(this.MakeFormattedMessage("Verbose", message, args));
        }

        public void Warn(string message, params object[] args)
        {
            this.logger.AddMessage(this.MakeFormattedMessage("Warn", message, args));
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
            this.events.OnNext(message);
        }
    }
}
