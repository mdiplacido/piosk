import * as React from 'react';
import { remote, BrowserWindow } from 'electron';
import * as fs from 'fs';

interface State {
  url: string;
}

export class App extends React.Component<{}, State> {
  private renderWindow: BrowserWindow;

  constructor(props?: any, context?: any) {
    super(props, context);
    this.state = {
      url: 'http://www.clocktab.com/'
    };
  }

  render() {
    return (
      // going to remote the React.Fragment, just testing something
      <React.Fragment>
        <div>
          <h2>POC for screen capture</h2>

          current url: {this.state.url}
          <br />
          <button onClick={this.screenshot}>Screenshot</button>
          <br />
          <button onClick={this.openWindow}>Open new window</button>
          <br />
          <button onClick={this.refresh}>Refresh</button>
          <br />
          <button onClick={this.maximize}>Maximize</button>
          <br />
          <button onClick={this.loadNewUrl}>Change url</button> to: {this.state.url}
          <br />
          <input type='text' onChange={this.handleOnUrlChange} />
        </div>
      </React.Fragment>
    );
  }

  handleOnUrlChange = (event: any) => {
    const target = event.target as HTMLInputElement;
    this.setState({ url: target.value });
  }

  loadNewUrl = () => {
    this.renderWindow.loadURL(this.state.url);
  }

  maximize = () => {
    this.renderWindow.setFullScreen(true);
  }

  refresh = () => {
    // using the refresh is not super reliable, it's much better just to reload the browser
    // location
    this.renderWindow.loadURL(this.state.url);
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
