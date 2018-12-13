import * as React from 'react';
import './App.css';
import { Navigation } from './components/navigation';

class App extends React.Component {
  public render() {
    return (
      <div className="App">
        <div className="jumble-tron">
          todo: here is where the images will display
        </div>
        <Navigation back={this.onBack} forward={this.onForward} pause={this.onPause} />
      </div>
    );
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
