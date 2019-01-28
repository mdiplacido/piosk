namespace windows_push_client
{
    using System;
    using System.Collections.Generic;
    using System.Net.Http;
    using System.Threading.Tasks;
    using System.Windows;
    using Microsoft.Toolkit.Win32.UI.Controls;
    using Microsoft.Toolkit.Win32.UI.Controls.Interop.WinRT;
    using Microsoft.Toolkit.Wpf.UI.Controls;
    using windows_push_client.Utility;

    public class SafeWebView : IWebView
    {
        public WebView unsafeView { get; private set; }

        private event EventHandler<WebViewControlNavigationCompletedEventArgs> _NavigationCompleted;
        private event EventHandler<WebViewControlNavigationStartingEventArgs> _NavigationStarting;
        private event EventHandler<WebViewControlNewWindowRequestedEventArgs> _NewWindowRequested;

        public double ActualWidth
        {
            get
            {
                if (this.unsafeView != null)
                {
                    return this.unsafeView.ActualWidth;
                }
                else
                {
                    // we are in a bad state, we don't care about the width or height
                    return 0;
                }
            }
        }

        public double ActualHeight
        {
            get
            {
                if (this.unsafeView != null)
                {
                    return this.unsafeView.ActualHeight;
                }
                else
                {
                    // we are in a bad state, we don't care about the width or height
                    return 0;
                }
            }
        }

        public Point PointToScreen(Point point)
        {
            if (this.unsafeView != null)
            {
                return this.unsafeView.PointToScreen(point);
            }

            return new Point(0, 0);
        }

        public SafeWebView(WebView view)
        {
            this.unsafeView = view;
        }

        public bool CanGoBack => throw new NotImplementedException();

        public bool CanGoForward => throw new NotImplementedException();

        public bool ContainsFullScreenElement => throw new NotImplementedException();

        public string DocumentTitle => throw new NotImplementedException();

        public string EnterpriseId { get => throw new NotImplementedException(); set => throw new NotImplementedException(); }
        public bool IsIndexedDBEnabled { get => throw new NotImplementedException(); set => throw new NotImplementedException(); }
        public bool IsJavaScriptEnabled { get => throw new NotImplementedException(); set => throw new NotImplementedException(); }
        public bool IsPrivateNetworkClientServerCapabilityEnabled { get => throw new NotImplementedException(); set => throw new NotImplementedException(); }
        public bool IsScriptNotifyAllowed { get => throw new NotImplementedException(); set => throw new NotImplementedException(); }

        public WebViewControlProcess Process => throw new NotImplementedException();

        public WebViewControlSettings Settings => throw new NotImplementedException();

        public Uri Source { get => throw new NotImplementedException(); set => throw new NotImplementedException(); }

        public Version Version => throw new NotImplementedException();

        public event EventHandler<WebViewControlAcceleratorKeyPressedEventArgs> AcceleratorKeyPressed;
        public event EventHandler<object> ContainsFullScreenElementChanged;
        public event EventHandler<WebViewControlContentLoadingEventArgs> ContentLoading;
        public event EventHandler<WebViewControlDOMContentLoadedEventArgs> DOMContentLoaded;
        public event EventHandler<WebViewControlContentLoadingEventArgs> FrameContentLoading;
        public event EventHandler<WebViewControlDOMContentLoadedEventArgs> FrameDOMContentLoaded;
        public event EventHandler<WebViewControlNavigationCompletedEventArgs> FrameNavigationCompleted;
        public event EventHandler<WebViewControlNavigationStartingEventArgs> FrameNavigationStarting;
        public event EventHandler<WebViewControlLongRunningScriptDetectedEventArgs> LongRunningScriptDetected;
        public event EventHandler<WebViewControlMoveFocusRequestedEventArgs> MoveFocusRequested;

        public event EventHandler<WebViewControlNavigationCompletedEventArgs> NavigationCompleted
        {
            add
            {
                this.unsafeView.NavigationCompleted += value;
                this._NavigationCompleted += value;
            }
            remove
            {
                this.unsafeView.NavigationCompleted -= value;
            }
        }

        public event EventHandler<WebViewControlNavigationStartingEventArgs> NavigationStarting
        {
            add
            {
                this.unsafeView.NavigationStarting += value;
                this._NavigationStarting += value;
            }
            remove
            {
                this.unsafeView.NavigationStarting -= value;
            }
        }

        public event EventHandler<WebViewControlNewWindowRequestedEventArgs> NewWindowRequested
        {
            add
            {
                this.unsafeView.NewWindowRequested += value;
                this._NewWindowRequested += value;
            }
            remove
            {
                this.unsafeView.NewWindowRequested -= value;
            }
        }

        public event EventHandler<WebViewControlPermissionRequestedEventArgs> PermissionRequested;
        public event EventHandler<WebViewControlScriptNotifyEventArgs> ScriptNotify;
        public event EventHandler<object> UnsafeContentWarningDisplaying;
        public event EventHandler<WebViewControlUnsupportedUriSchemeIdentifiedEventArgs> UnsupportedUriSchemeIdentified;
        public event EventHandler<WebViewControlUnviewableContentIdentifiedEventArgs> UnviewableContentIdentified;

        public void AddInitializeScript(string script)
        {
            throw new NotImplementedException();
        }

        public void AddPreLoadedScript(string script)
        {
            throw new NotImplementedException();
        }

        public void Close()
        {
            throw new NotImplementedException();
        }

        public WebViewControlDeferredPermissionRequest GetDeferredPermissionRequestById(uint id)
        {
            throw new NotImplementedException();
        }

        public bool GoBack()
        {
            throw new NotImplementedException();
        }

        public bool GoForward()
        {
            throw new NotImplementedException();
        }

        public string InvokeScript(string scriptName)
        {
            throw new NotImplementedException();
        }

        public string InvokeScript(string scriptName, params string[] arguments)
        {
            throw new NotImplementedException();
        }

        public string InvokeScript(string scriptName, IEnumerable<string> arguments)
        {
            throw new NotImplementedException();
        }

        public Task<string> InvokeScriptAsync(string scriptName)
        {
            throw new NotImplementedException();
        }

        public Task<string> InvokeScriptAsync(string scriptName, params string[] arguments)
        {
            throw new NotImplementedException();
        }

        public Task<string> InvokeScriptAsync(string scriptName, IEnumerable<string> arguments)
        {
            throw new NotImplementedException();
        }

        public void MoveFocus(WebViewControlMoveFocusReason reason)
        {
            throw new NotImplementedException();
        }

        public void Navigate(Uri source)
        {
            if (this.unsafeView != null)
            {
                this.unsafeView.Navigate(source);
            }
            else
            {
                // just message with navigation complete
                _NavigationStarting.Invoke(this, null);
                _NavigationCompleted.Invoke(this, null);
            }
        }

        public void Navigate(string source)
        {
            if (this.unsafeView != null)
            {
                this.unsafeView.Navigate(source);
            }
            else
            {
                // just message with navigation complete
                _NavigationStarting.Invoke(this, null);
                _NavigationCompleted.Invoke(this, null);
            }
        }

        public void Navigate(Uri requestUri, HttpMethod httpMethod, string content = null, IEnumerable<KeyValuePair<string, string>> headers = null)
        {
            throw new NotImplementedException();
        }

        public void NavigateToLocal(string relativePath)
        {
            throw new NotImplementedException();
        }

        public void NavigateToLocalStreamUri(Uri relativePath, IUriToStreamResolver streamResolver)
        {
            throw new NotImplementedException();
        }

        public void NavigateToString(string text)
        {
            throw new NotImplementedException();
        }

        public void Refresh()
        {
            throw new NotImplementedException();
        }

        public void Stop()
        {
            throw new NotImplementedException();
        }

        #region IDisposable Support - not really IDisposable, just following the pattern
        private bool disposedValue = false; // To detect redundant calls

        protected virtual void Dispose(bool disposing)
        {
            if (!disposedValue)
            {
                if (disposing)
                {
                    var instance = this.unsafeView;

                    // this is a serious hack.  under certain circumstances if i 
                    // dispose immediately the Edge hosting process blows up.  We need
                    // to explicitly release these WebViews, otherwise the Edge hosting
                    // process eats up all the memory on the machine.  This hack appears
                    // to keep memory consumption nice and steady without blowing up if
                    // an immediate dispose is done.
                    TimerUtility.RunSafeDelayedAction(
                        () => instance?.Dispose(), 
                        TimeSpan.FromMilliseconds(2000),
                        error => {
                            instance?.Dispose();
                        });

                    this.unsafeView = null;
                }

                disposedValue = true;
            }
        }

        // This code added to correctly implement the disposable pattern.
        public void Dispose()
        {
            // Do not change this code. Put cleanup code in Dispose(bool disposing) above.
            Dispose(true);
        }
        #endregion
    }
}
