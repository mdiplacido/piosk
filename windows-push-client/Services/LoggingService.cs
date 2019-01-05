namespace windows_push_client.Services
{
    using System;
    using System.Reactive.Linq;
    using System.Reactive.Subjects;

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

        public void Add(string message)
        {
            this.events.OnNext(message);
        }
    }  
}
