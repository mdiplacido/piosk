import * as React from 'react';
import { faChevronLeft, faChevronRight, faPause, faQrcode } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './navigation.css';

const back = <FontAwesomeIcon icon={faChevronLeft} />
const pause = <FontAwesomeIcon icon={faPause} />
const forward = <FontAwesomeIcon icon={faChevronRight} />
const qrcode = <FontAwesomeIcon icon={faQrcode} />

export interface INavigation {
    back: () => void;
    forward: () => void;
    pause: () => void;
}

export interface IState {
    isOpen: boolean;
}

export class Navigation extends React.Component<INavigation> {
    public state: IState = {
        isOpen : true,
    };

    public handleOpen = () => {
        console.log("opening nav bar");
        this.setState({ isOpen: true });
    };

    public handleClose = () => {
        console.log("closing nav bar");
        this.setState({ isOpen: false });
    };

    public render() {
        const navigationClass = this.state.isOpen ? ' open' : ' close'; 
        return (
            <div 
                className={"navigation-center-container" + navigationClass}
                onMouseEnter={this.handleOpen} 
                onMouseLeave={this.handleClose}
                onClick={ this.state.isOpen? this.handleClose: this.handleOpen}
            >
                <div className="navigation-container">
                    <button onClick={this.props.back}>{back}</button>
                    <button onClick={this.props.pause}>{pause}</button>
                    <button onClick={this.props.forward}>{forward}</button>

                    {/* category ddl fits here  */}
                    <button>{qrcode}</button>
                </div>
            </div>
        );
    }
}