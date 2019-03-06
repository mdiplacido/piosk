import { createMuiTheme, CssBaseline, MuiThemeProvider } from "@material-ui/core";
import { BrowserWindow, remote } from "electron";
import * as React from "react";
import { connect } from "react-redux";
import { HashRouter } from "react-router-dom";

import AppRoutes from "./app.routes";
import NavBar from "./components/common/nav-bar";
import Notification from "./components/common/notification";
import PublisherProvider from "./providers/capture-publisher/publisher.provider";
import ConfigProvider from "./providers/config/config.provider";
import { IConfigActionsProp, mapConfigActionsToProps } from "./store/config/actions";
import { isConfigLoadingSelector } from "./store/loading.selectors";
import {
  ILoggerActionsProp,
  LoggerSeverity,
  mapLoggerActionsToProps,
} from "./store/logger/actions";
import IState from "./store/state";
import { combineActionPropMappers } from "./store/utility";

// tslint:disable:no-var-requires
// tslint:disable:no-require-imports
const LoadingOverlay = require("react-loading-overlay").default as typeof React.Component;

interface State {
  url: string;
  image?: Electron.NativeImage;
}

export interface Controller {
  screenshot: () => void;
  openWindow: () => void;
  loadUrl: () => void;
  maximize: () => void;
  urlChange: (url: string) => void;
}

const theme = createMuiTheme({
  typography: {
    useNextVariants: true,
  },
  palette: {
    type: "light",
    primary: {
      main: "#0078d4"
    }
  }
});

export interface IAppStateProps {
  isConfigLoading: boolean;
}

type AppActionsProps = IConfigActionsProp & ILoggerActionsProp;

export type AppProps = IAppStateProps & AppActionsProps;

export class App extends React.Component<AppProps, State> implements Controller {
  private renderWindow: BrowserWindow;

  constructor(props: AppProps) {
    super(props);
    this.state = {
      url: "http://www.clocktab.com/"
    };
  }

  componentDidMount(): void {
    this.props.loggerActions.next("App mounted, dispatching load config...", LoggerSeverity.Verbose);
    this.props.configActions.loadConfig();
  }

  render() {
    return (
      // note: REDUX provider is located in the bootstrapping index.html, this is done because App depends on
      // the provider so we we need to hoist it up one level
      <ConfigProvider>
        <PublisherProvider>
          <MuiThemeProvider theme={theme}>
            <CssBaseline />
            {/* intentionally using hash router.  electron expects the file to be on disk
        so development is tricky with the BrowserRouter. */}
            <HashRouter>
              <LoadingOverlay
                active={this.props.isConfigLoading}
                spinner
                text="Loading..."
              >
                <NavBar />
                {
                  !this.props.isConfigLoading &&
                  <AppRoutes
                    controller={this}
                    image={this.state.image}
                    url={this.state.url} />
                }
                <Notification />
              </LoadingOverlay>
            </HashRouter>
          </MuiThemeProvider>
        </PublisherProvider>
      </ConfigProvider>
    );
  }

  urlChange = (url: string) => {
    this.setState({ url });
  }

  loadUrl = () => {
    this.renderWindow.loadURL(this.state.url);
  }

  maximize = () => {
    this.renderWindow.setFullScreen(true);
  }

  openWindow = () => {
    this.renderWindow = new remote.BrowserWindow({
      webPreferences: {
        nodeIntegration: false,
        webSecurity: false /* probably should make this an option per capture */
      }
    });
    this.renderWindow.loadURL(this.state.url);

    // todo: attaching the dev tools should be optional and may not be available depending on
    // the build.
    this.renderWindow.webContents.openDevTools();
  }

  screenshot = () => {
    this.renderWindow.capturePage(image => this.setState({ image }));
    // fs.writeFile('/var/jail/data/piosk_pickup/test.png', img.toPNG(),
    //   () => {
    //     // callback, no-op for now
    //   }));
  }
}

function mapStateToProps(state: IState): IAppStateProps {
  return {
    isConfigLoading: isConfigLoadingSelector(state)
  } as IAppStateProps;
}

const propMapper = combineActionPropMappers<AppActionsProps>(mapConfigActionsToProps, mapLoggerActionsToProps);

// tslint:disable-next-line:max-line-length
export default connect<IAppStateProps, AppActionsProps, AppProps, IState>(mapStateToProps, propMapper)(App);
