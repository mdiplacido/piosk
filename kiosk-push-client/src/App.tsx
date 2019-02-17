import * as React from 'react';
import { remote, BrowserWindow } from 'electron';
import * as fs from 'fs';

interface State {
  url: string;
}

export class App extends React.Component<undefined, State> {
  private renderWindow: BrowserWindow;

  constructor(props?: any, context?: any) {
    super(props, context);
    this.state = {
      url: 'http://www.clocktab.com/'
    };
  }

  render() {
    return (
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
    this.renderWindow.reload();
  }

  openWindow = () => {
    this.renderWindow = new remote.BrowserWindow();
    this.renderWindow.loadURL(this.state.url);
  }

  screenshot = () => {
    this.renderWindow.capturePage(img =>
      fs.writeFile('/var/jail/data/piosk_pickup/test.png', img.toPNG(),
        () => {
          // callback, no-op for now
        }));
  }
}
