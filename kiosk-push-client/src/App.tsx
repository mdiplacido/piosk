import * as React from "react";
import AppRoutes from "./app.routes";
import CaptureController from "./components/capture/controller";
import ConfigProvider from "./providers/config/config.provider";
import IState from "./store/state";
import NavBar from "./components/common/nav-bar";
import Notification from "./components/common/notification";
import PublisherProvider from "./providers/capture-publisher/publisher.provider";
import { CaptureService } from "./providers/capture-service/capture.service";
import { CaptureServiceContext } from "./providers/capture-service/provider";
import { combineActionPropMappers } from "./store/utility";
import { connect } from "react-redux";
import {
  createMuiTheme,
  CssBaseline,
  MuiThemeProvider
} from "@material-ui/core";
import { HashRouter } from "react-router-dom";
import {
  IConfigActionsProp,
  mapConfigActionsToProps
} from "./store/config/actions";
import {
  ILoggerActionsProp,
  LoggerSeverity,
  mapLoggerActionsToProps
} from "./store/logger/actions";
import { isConfigLoadingSelector } from "./store/loading.selectors";

// tslint:disable:no-var-requires
// tslint:disable:no-require-imports
const LoadingOverlay = require("react-loading-overlay").default as typeof React.Component;

interface State {
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

export class App extends React.Component<AppProps, State> {
  constructor(props: AppProps) {
    super(props);
    this.state = {};
  }

  componentDidMount(): void {
    this.props.loggerActions.next("App mounted, dispatching load config...", LoggerSeverity.Verbose);
    this.props.configActions.loadConfig();
  }

  render() {
    const captureService = new CaptureService();
    return (
      // note: REDUX provider is located in the bootstrapping index.html, this is done because App depends on
      // the provider so we we need to hoist it up one level
      <ConfigProvider>
        <PublisherProvider>
          <CaptureServiceContext.Provider value={captureService}>
            <CaptureController />
          </CaptureServiceContext.Provider>
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
                  <div className="routeContainer">
                    <AppRoutes />
                  </div>
                }
                <Notification />
              </LoadingOverlay>
            </HashRouter>
          </MuiThemeProvider>
        </PublisherProvider>
      </ConfigProvider>
    );
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
