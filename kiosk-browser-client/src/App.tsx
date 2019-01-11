import * as React from 'react';
import Sockette from 'sockette';
import { IImagePayload, IKioskMessage, KioskMessageType } from './model/payloads';
import { Navigation } from './components/navigation';
import './App.css';
import { Spinner } from "./components/spinner";

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
  showNavigationBar: boolean;
  hasPrev: boolean;
  hasNext: boolean;
}

class App extends React.Component<any, IState> {
  public state: IState = {
    connectionState: ConnectionState.initializing,
    currentImage: null as any as IImagePayload,
    hasNext: this.getNextButton(),
    hasPrev: this.getPrevButton(),
    images: [],
    maxImages: 10,
    showNavigationBar: false
  };

  public componentDidMount() {
    const ws = new Sockette("ws://localhost:8081", {
      timeout: 5000,
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
    let fadeNavTimer: NodeJS.Timeout;

    const startNavFading = () => {
      fadeNavTimer = setTimeout(() => {
        this.setState({ showNavigationBar: false });
      }, 8000);
    };

    const stopNavFading = () => {
      if (typeof fadeNavTimer !== "undefined") {
        clearTimeout(fadeNavTimer);
      }
    };

    const showNavigationBar = () => {
      stopNavFading();

      if (!this.state.showNavigationBar) {
        this.setState({ showNavigationBar: true });
        startNavFading();
      }
    };

    if (this.state.connectionState !== ConnectionState.connected) {
      return this.getDisconnectedBlock();
    } else {
      return (
        <div className="App" onMouseMove={showNavigationBar}>
          <div className="img-box">
            {
              this.state.currentImage ? (
              <img className="center-fit" src={`data:image/png;base64,${this.state.currentImage.data}`} />) : 
              ( <div>No images to show</div>)
            }
          </div>
          <Navigation 
            back={this.onBack}
            forward={this.onForward}
            pause={this.onPause} 
            openNav={this.state.showNavigationBar} 
            toggleNav={this.toggleNavigationBar}
            disableNext={!this.state.hasNext}
            disablePrev={!this.state.hasPrev}
          />
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
            hasNext: images.indexOf(currentImage) < images.length - 1,
            hasPrev: images.indexOf(currentImage) > 0,
            images,
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
    return <div>
      <Spinner text={this.getConnectionStatusMessage()} spin={this.state.connectionState !== ConnectionState.failed} />
    </div>;
  }

  private getConnectionStatusMessage(): string {
    switch (this.state.connectionState) {
      case ConnectionState.connected:
        throw new Error(`Invalid state ${this.state.connectionState}`);
      case ConnectionState.failed:
        return "Connection failed!";
      case ConnectionState.reconnecting:
        return "Reconnecting...";
      case ConnectionState.initializing:
      default:
        return "Connecting...";
    }
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

    this.setState({
      currentImage: this.state.images[index],
      hasNext: index < this.state.images.length - 1,
      hasPrev: index > 0
    });

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
  };

  private getNextButton() {
    return this.state &&
      this.state.images &&
      this.state.images.indexOf(this.state.currentImage) < this.state.images.length - 1;
  }

  private getPrevButton() {
    return this.state &&
      this.state.images &&
      this.state.images.indexOf(this.state.currentImage) > 0;
  }

  private toggleNavigationBar = () => {
    this.setState({ showNavigationBar: !this.state.showNavigationBar });
  };
}

export default App;
