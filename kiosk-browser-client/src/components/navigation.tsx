import { faChevronLeft, faChevronRight, faPause, faQrcode } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as React from 'react';
import "./navigation.css";

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
    return <div className="navigation-container">
            <div>
                <button onClick={props.back}>{back}</button>
                <button onClick={props.pause}>{pause}</button>
                <button onClick={props.forward}>{forward}</button>
            </div>
            <div>
               {/* category ddl fits here  */}
                <button>{qrcode}</button>
            </div>
        </div>;
}