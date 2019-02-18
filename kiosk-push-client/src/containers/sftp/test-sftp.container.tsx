import * as React from 'react';
import { ChangeEvent } from 'react';
// tslint:disable:no-require-imports
// tslint:disable:no-var-requires
const Client = require('ssh2-sftp-client');

export interface TestSFTPContainerProps {
  image?: Electron.NativeImage;
}

export interface State {
  password: string;
  username: string;
}

export default class TestSFTPContainer extends React.Component<TestSFTPContainerProps, State> {
  render() {
    return (
      <div>
        <input type='text' onChange={this.onUsernameChange} />
        <br />
        <input type='password' onChange={this.onPasswordChange} />
        <br />
        <button disabled={!this.props.image} onClick={this.upload}>Upload Image</button>
      </div>
    );
  }

  private onUsernameChange = (event: ChangeEvent<HTMLInputElement>) => {
    this.setState({ username: event.target.value });
  }

  private onPasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    this.setState({ password: event.target.value });
  }

  private upload = () => {
    const image = this.props.image as Electron.NativeImage;
    const client = new Client();

    client
      .connect({
        host: 'xxx.xxx.xxx.xxx',
        port: '22',
        username: this.state.username,
        password: this.state.password
      })
      .then(() => {
        return client.put(image.toPNG(), 'from-client.png');
      })
      .then((success: any) => {
        console.log(`Got success ${success}`);
      })
      .catch((err: any) => {
        console.error(err, 'catch error');
      });
  }
}
