import { BrowserWindow, remote } from 'electron';
import * as fs from 'fs';
import * as React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import MainContainer from './containers/main/main.container';

interface State {
  url: string;
}

export interface Controller {
  screenshot: () => void;
  openWindow: () => void;
  loadUrl: () => void;
  maximize: () => void;
  urlChange: (url: string) => void;
}

export class App extends React.Component<{}, State> implements Controller {
  private renderWindow: BrowserWindow;

  state = {
    url: 'http://www.clocktab.com/'
  };

  render() {
    return (
      // going to remote the React.Fragment, just testing something
      <BrowserRouter>
        <Switch>
          <Route render={() => <MainContainer url={this.state.url} controller={this}></MainContainer>} />
        </Switch>
      </BrowserRouter>
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
    this.renderWindow.capturePage(img =>
      fs.writeFile('/var/jail/data/piosk_pickup/test.png', img.toPNG(),
        () => {
          // callback, no-op for now
        }));
  }
}
