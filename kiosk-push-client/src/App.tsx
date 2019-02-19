import { createMuiTheme, CssBaseline, MuiThemeProvider } from "@material-ui/core";
import { BrowserWindow, remote } from "electron";
import * as React from "react";
import { HashRouter } from "react-router-dom";

import AppRoutes from "./app.routes";
import NavBar from "./components/common/nav-bar";

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

export class App extends React.Component<{}, State> implements Controller {
  private renderWindow: BrowserWindow;

  state: Readonly<State> = {
    url: "http://www.clocktab.com/"
  };

  render() {
    return (
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {/* intentionally using hash router.  electron expects the file to be on disk
        so development is tricky with the BrowserRouter. */}
        <HashRouter>
          <React.Fragment>
            <NavBar />
            <AppRoutes
              controller={this}
              image={this.state.image}
              url={this.state.url} />
          </React.Fragment>
        </HashRouter>
      </MuiThemeProvider>
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
