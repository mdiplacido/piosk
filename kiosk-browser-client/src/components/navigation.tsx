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

export const Navigation = (props: INavigation) => {
    return (
        <div className="navigation-center-container">
            <div className="navigation-container">
                <button onClick={props.back}>{back}</button>
                <button onClick={props.pause}>{pause}</button>
                <button onClick={props.forward}>{forward}</button>

               {/* category ddl fits here  */}
                <button>{qrcode}</button>
            </div>
        </div>
    );
}