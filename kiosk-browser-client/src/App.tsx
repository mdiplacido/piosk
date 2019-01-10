import "./App.css";

import * as React from "react";
import Sockette from "sockette";

import { Navigation } from "./components/navigation";
import { IImagePayload, IKioskMessage, KioskMessageType } from "./model/payloads";

enum ConnectionState {
  initializing,
  connected,
  failed,
  reconnecting,
}

interface IState {
  connectionState: ConnectionState;
  images: IImagePayload[];
  currentImage: IImagePayload;
  ws?: Sockette;
}

class App extends React.Component<any, IState> {
  public state: IState = { 
    connectionState: ConnectionState.initializing,
    currentImage: null as any as IImagePayload,
    images: [],
  };

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
              this.state.currentImage ?
                <img src={`data:image/png;base64,${this.state.currentImage.data}`} /> :
                <div>No images to show</div>
            }
          </div>
          <Navigation back={this.onBack} forward={this.onForward} pause={this.onPause} />
        </div>
      );
    }
  }

  private handleMessage(msg: MessageEvent): void {
    const kioskMessage: IKioskMessage = JSON.parse(msg.data);

    switch (kioskMessage.type) {
      case KioskMessageType.Image: {
        const imagePayload = kioskMessage.payload as IImagePayload;
        this.setState(prev => ({ currentImage: imagePayload, images: [...prev.images, imagePayload] }));
        break;
      }
      default:
        console.log(`cannot handle type '${kioskMessage.type}'`);
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
    this.move("back");
  };

  private onForward = () => {
    this.move("forward");
  };

  private move(direction: "forward" | "back") {
    const add = direction === "forward" ? 1 : -1;
    const index = this.state.images.indexOf(this.state.currentImage) + add;

    if (index < 0 || index > this.state.images.length - 1) {
      return;
    }

    this.setState(( { currentImage: this.state.images[index] } ));
    return;
  }

  private onPause = () => {
    alert("got to pause");
    return;
  };
}

export default App;
