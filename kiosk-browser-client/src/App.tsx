import './App.css';

import * as React from 'react';
import Sockette from 'sockette';

import { Navigation } from './components/navigation';

interface IState {
  connected: boolean;
  image?: string;
  ws?: Sockette;
}

class App extends React.Component {
  public state: IState = { connected: false };

  public componentDidMount() {
    const ws = new Sockette("ws://localhost:8080", {
      onmessage: msg => this.setState({ image: msg.data }),
      onopen: () => this.setState({ connected: true }),
    });

    this.setState({ ws });
  }

  public render() {
    const connected = !!this.state.connected;

    if (!connected) {
      return (
        <div>Connecting...</div>
      );
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
