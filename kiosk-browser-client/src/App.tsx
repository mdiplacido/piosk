import * as React from 'react';
import Sockette from 'sockette';
import { IImagePayload, IKioskMessage, KioskMessageType } from './model/payloads';
import { Navigation } from './components/navigation';
import './App.css';

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
  maxImages: number;
  ws?: Sockette;
}

class App extends React.Component<any, IState> {
  public state: IState = {
    connectionState: ConnectionState.initializing,
    currentImage: null as any as IImagePayload,
    images: [],
    maxImages: 10
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
          <div className="img-box">
            {
              this.state.currentImage ?
                <img className="center-fit" src={`data:image/png;base64,${this.state.currentImage.data}`} /> :
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

        // we are not guaranteed to get images in order, currently when the server starts there is a special case
        // were we are not sorting the incoming initial images on disk.  for now we will sort on the client.
        // we will not assume that the current image is the latest
        this.setState(prev => {
          const images = this.pruneAndSortImages([...prev.images, imagePayload]);
          const currentImage = images[images.length - 1];
          return {
            currentImage,
            images
          };
        });

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

    this.setState(({ currentImage: this.state.images[index] }));
    return;
  }

  private onPause = () => {
    alert("got to pause");
    return;
  };

  private pruneAndSortImages = (images: IImagePayload[]) => {
    // we sort images ascending.
    const sortedImages = images.sort((a, b) => a.birthtimeMs - b.birthtimeMs);

    const keepIndex = Math.max(0, sortedImages.length - this.state.maxImages);

    // we will drop any images over max
    // tslint:disable-next-line:variable-name
    return sortedImages.filter((_image, i) => i >= keepIndex);
  }
}

export default App;
