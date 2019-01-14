import * as React from 'react';
import * as QRCode from 'qrcode.react';
import Sockette from 'sockette';
import { IImagePayload, IKioskMessage, KioskMessageType } from './model/payloads';
import { Navigation } from './components/navigation';
import { Spinner } from './components/spinner';
import './App.scss';

enum ConnectionState {
  initializing,
  connected,
  failed,
  reconnecting,
}

interface IState {
  connectionState: ConnectionState;
  images: IImagePayload[];
  isPaused: boolean;
  currentImage: IImagePayload;
  imageDisplayTimeMs: number;
  maxImages: number;
  showNavigationBar: boolean;
  hasPrev: boolean;
  hasNext: boolean;
  hasQR: boolean;
  showQR: boolean;
}

class App extends React.Component<any, IState> {
  public state: IState = {
    connectionState: ConnectionState.initializing,
    currentImage: null as any as IImagePayload,
    hasNext: false,
    hasPrev: false,
    hasQR: false,
    imageDisplayTimeMs: 0,
    images: [],
    isPaused: false,
    maxImages: 10,
    showNavigationBar: false,
    showQR: false,
  };

  private fadeNavTimer?: number;
  private slideshowTimer?: number;

  public componentDidMount() {
    this.setupSockette();
    this.startSlideShow();
  }

  public componentWillUnmount() {
    window.clearTimeout(this.fadeNavTimer);
    window.clearTimeout(this.slideshowTimer);
  }

  public render() {
    if (this.state.connectionState !== ConnectionState.connected) {
      return this.getDisconnectedBlock();
    } else {
      return (
        <div className="App" onMouseMove={this.handleShowNavigationBar}>
          <div className="img-box">
            {
              this.state.currentImage ? (
                <img className="center-fit" src={`data:image/png;base64,${this.state.currentImage.data}`} />) :
                <Spinner spin={true} text="No images to show, waiting for images..." />
            }
          </div>
          <div className={`qr-box ${this.state.showQR ? 'open' : 'close'}`}>
            {
              this.state.hasQR && this.state.currentImage ? 
              (<QRCode value={this.state.currentImage.url ? this.state.currentImage.url : "https://www.microsoft.com/"} renderAs="svg" />) : 
              <span />
            }
          </div>

          {/* note using class property bound functions for all handlers passed to Navigation */}
          <Navigation
            back={this.handleBack}
            forward={this.handleForward}
            isPaused={this.state.isPaused}
            pause={this.handleOnPause}
            openNav={this.state.showNavigationBar}
            closeNav={this.handleHideNavigationBar}
            disableNext={!this.state.hasNext}
            disablePrev={!this.state.hasPrev}
            disableQR={!this.state.hasQR}
            toggleQR={this.handleToggleQRCode}
          />
        </div>
      );
    }
  }

  private handleBack = () => {
    this.move("back");
  };

  private handleForward = () => {
    this.move("forward");
  };

  private handleOnPause = () => {
    this.setState(prev => ({
      isPaused: !prev.isPaused,
    }));
  };

  private handleHideNavigationBar = () => {
    this.setState({ showNavigationBar: false });
  };

  private handleShowNavigationBar = () => {
    this.stopNavFading();
    this.setState({ showNavigationBar: true });
    this.startNavFading();
  };

  private handleToggleQRCode = () => {
    this.setState(prev => ({
      showQR: !prev.showQR,
    }));
  };

  private onSocketteMessage(msg: MessageEvent): void {
    const kioskMessage: IKioskMessage = JSON.parse(msg.data);

    switch (kioskMessage.type) {
      case KioskMessageType.Image: {
        const imagePayload = kioskMessage.payload as IImagePayload;

        // we are not guaranteed to get images in order, currently when the server starts there is a special case
        // were we are not sorting the incoming initial images on disk.  for now we will sort on the client.
        // we will not assume that the current image is the latest
        this.setState(prev => {
          const images = this.pruneAndSortImages([...prev.images, imagePayload]);

          const currentImage = !this.state.isPaused ?
            images[images.length - 1] :
            this.state.currentImage;

          const imageDisplayTimeMs = !this.state.isPaused ?
            new Date().getTime() :
            prev.imageDisplayTimeMs;

          return {
            currentImage,
            hasNext: images.indexOf(currentImage) < images.length - 1,
            hasPrev: images.indexOf(currentImage) > 0,
            hasQR: !!currentImage.url,
            imageDisplayTimeMs,
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

  private getDisconnectedBlock(): JSX.Element {
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

  private startNavFading(): void {
    this.fadeNavTimer = window.setTimeout(() => {
      this.handleHideNavigationBar();
    }, 8000);
  };

  private stopNavFading(): void {
    window.clearTimeout(this.fadeNavTimer);
  };

  private move(direction: "forward" | "back", isSlideShowCaller = false): void {
    const add = direction === "forward" ? 1 : -1;
    let index = this.state.images.indexOf(this.state.currentImage) + add;

    if (index < 0 || (index > this.state.images.length - 1 && !isSlideShowCaller)) {
      // if the caller is the user invoking the next then we will not allow
      // the user to move next.  Technically next should be disabled, but
      // this is a sanity check.
      return;
    } else if (index > this.state.images.length - 1) {
      // caller is the slideshow, we'll just wrap back to the beginning
      index = 0;
    }

    this.setState({
      currentImage: this.state.images[index],
      hasNext: index < this.state.images.length - 1,
      hasPrev: index > 0,
      hasQR: !!this.state.images[index].url,
      imageDisplayTimeMs: new Date().getTime()
    });
  }

  private pruneAndSortImages(images: IImagePayload[]): IImagePayload[] {
    // we sort images ascending.
    const sortedImages = images.sort((a, b) => a.birthtimeMs - b.birthtimeMs);

    const keepIndex = Math.max(0, sortedImages.length - this.state.maxImages);

    // we will drop any images over max
    // tslint:disable-next-line:variable-name
    return sortedImages.filter((_image, i) => i >= keepIndex);
  };

  private setupSockette(): void {
    (() => new Sockette("ws://localhost:8081", {
      timeout: 5000,
      // adding slight delay before we post the error.  there's a weird condition
      // where the "connecting" or "reconnecting" do not get a chance to show
      // especially when the connection to the server quickly fails.
      // tslint:disable-next-line:object-literal-sort-keys
      onerror: () => window.setTimeout(() =>
        this.setState({ connectionState: ConnectionState.failed }), 2000),
      onmessage: msg => this.onSocketteMessage(msg),
      onopen: () =>
        this.setState({ connectionState: ConnectionState.connected }),
      onreconnect: () =>
        this.setState({ connectionState: ConnectionState.reconnecting })
    }))();
  }

  private startSlideShow(slideShowIntervalMs = 8000): void {
    this.slideshowTimer = window.setTimeout(() => {
      // each image should have at least 8 seconds to 
      // be on the screen, if the current image has been
      // on for less then we'll just cancel this timer
      // and call ourselves gain.
      const timeRemaining =
        Math.max(0, slideShowIntervalMs - (new Date().getTime() - this.state.imageDisplayTimeMs));

      console.log(`slideshow time remaining is ${timeRemaining}ms`);

      if (!timeRemaining) {
        if (!this.state.isPaused) {
          // cannot proceed, we are paused.
          // we will fire again in SlideShowIntervalMs
          console.log(`slide show timer moving forward`);
          this.move("forward", true /* isSlideShowCaller */);
        } else {
          console.log("slide show timer came due, but the slide show is paused...");
        }

        // if we moved or not we have to start a new interval of the slideshow timer
        this.startSlideShow();
      } else {
        // schedule a new one for timeRemaining
        console.log(`time remaining ${this.slideshowTimer}`);
        this.startSlideShow(timeRemaining);
      }
    }, slideShowIntervalMs);
  }
}

export default App;
