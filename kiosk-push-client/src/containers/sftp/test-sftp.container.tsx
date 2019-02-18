import * as React from 'react';

export interface TestSFTPContainerProps {
    image?: Electron.NativeImage;
}

export default class TestSFTPContainer extends React.Component<TestSFTPContainerProps> {
  render() {
    return (
      <div>
        <input type='password' />
        <br/>
        <button disabled={!this.props.image}>Upload Image</button>
      </div>
    );
  }
}
