import { BrowserWindow, remote } from 'electron';
import * as React from 'react';
import { BrowserRouter, NavLink, Route, Switch } from 'react-router-dom';

import MainContainer from './containers/main/main.container';
import TestSFTPContainer from './containers/sftp/test-sftp.container';

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

export class App extends React.Component<{}, State> implements Controller {
  private renderWindow: BrowserWindow;

  state: Readonly<State> = {
    url: 'http://www.clocktab.com/'
  };

  render() {
    return (
      <BrowserRouter>
        <React.Fragment>
          <nav>
            <NavLink to='/' activeClassName='active'>Home</NavLink>
            {' | '}
            <NavLink to='/test-sftp' activeClassName='active'>Test SFTP</NavLink>
          </nav>
          <Switch>
            <Route path='/test-sftp' render={() => <TestSFTPContainer image={this.state.image}></TestSFTPContainer>} />
            <Route render={() => <MainContainer url={this.state.url} controller={this}></MainContainer>} />
          </Switch>
        </React.Fragment>
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
    this.renderWindow.capturePage(image => this.setState({ image }));
    // fs.writeFile('/var/jail/data/piosk_pickup/test.png', img.toPNG(),
    //   () => {
    //     // callback, no-op for now
    //   }));
  }
}
