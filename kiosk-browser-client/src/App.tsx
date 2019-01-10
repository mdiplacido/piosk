import './App.css';

import * as React from 'react';
import Sockette from 'sockette';

import { Navigation } from './components/navigation';

enum ConnectionState {
  initializing,
  connected,
  failed,
  reconnecting,
}

interface IState {
  connectionState: ConnectionState;
  image?: string;
  ws?: Sockette;
}

class App extends React.Component {
  public state: IState = { connectionState: ConnectionState.initializing };

  public componentDidMount() {
    const ws = new Sockette("ws://localhost:8081", {
      timeout: 3000,
      // tslint:disable-next-line:object-literal-sort-keys
      onerror: () =>
        this.setState({ connectionState: ConnectionState.failed }),
      onmessage: msg => this.handleMessage(msg),        
      onopen: () =>
        this.setState({ connectionState: ConnectionState.connected }),
      onreconnect: () =>
        this.setState({ connectionState: ConnectionState.reconnecting })
    });

    this.setState({ ws });
  }

  public render() {
    if (this.state.connectionState !== ConnectionState.connected) {
      return this.getDisconnectedBlock();
    } else {
      return (
        <div className="App">
          <div className="jumble-tron">
            {
              this.state.image ?
                <img src={`data:image/png;base64,${this.state.image}`} /> :
                <div>No images to show</div>
            }
          </div>
          <Navigation back={this.onBack} forward={this.onForward} pause={this.onPause} />
        </div>
      );
    }
  }

  private handleMessage(msg: MessageEvent): void {
    const kioskMessage: IKioskMessage = msg.data;

    switch (kioskMessage.type) {
      case KioskMessageType.Image: {
        const imageInfo = kioskMessage.payload as IImagePayload
        this.setState({ image: imageInfo.data });
        break;        
      }
      default:
        console.log(`cannot handle type ${kioskMessage.type}`);
        break;
    }
  }

  private getDisconnectedBlock() {
    let block: JSX.Element;

    switch (this.state.connectionState) {
      case ConnectionState.connected:
        throw new Error(`Invalid state ${this.state.connectionState}`);
      case ConnectionState.failed:
        block = (
          <div>Connection failed!</div>
        );
        break;
      case ConnectionState.reconnecting:
        block = (
          <div>Reconnecting...</div>
        );
        break;
      case ConnectionState.initializing:
      default:
        block = (
          <div>Connecting...</div>
        );
        break;
    }

    return block;
  }

  private onBack = () => {
    alert("got to back");
    return;
  };

  private onForward = () => {
    alert("got to forward");
    return;
  };

  private onPause = () => {
    alert("got to pause");
    return;
  };
}

export default App;
