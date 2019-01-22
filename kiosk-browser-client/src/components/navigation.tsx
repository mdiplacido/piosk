import * as React from 'react';
import {
    faChevronLeft,
    faChevronRight,
    faPause,
    faQrcode,
    faTimesCircle
    } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './navigation.scss';

const back = <FontAwesomeIcon icon={faChevronLeft} />
const pause = (isPaused: boolean) => <FontAwesomeIcon icon={faPause} spin={isPaused} />
const forward = <FontAwesomeIcon icon={faChevronRight} />
const qrcode = <FontAwesomeIcon icon={faQrcode} />
const close = <FontAwesomeIcon icon={faTimesCircle} />

export interface INavigation {
    openNav: boolean;
    disableNext: boolean;
    disablePrev: boolean;
    disableQR: boolean;
    isPaused: boolean;
    closeNav: () => void;
    back: () => void;
    forward: () => void;
    pause: () => void;
    toggleQR: () => void;
}

export const Navigation = (props: INavigation) => {
    const navigationClass = props.openNav ? 'open' : 'close';

    function handleClose(event: any) {
        event.preventDefault();
        props.closeNav();
    }

    return (
        <div
            className={`navigation-center-container ${navigationClass}`}>
            <div className="navigation-container">
                <span className='close-button' onClick={handleClose}>{close}</span>

                <button onClick={props.back} disabled={props.disablePrev}>{back}</button>
                <button onClick={props.pause}>{pause(props.isPaused)}</button>
                <button onClick={props.forward} disabled={props.disableNext}>{forward}</button>

                {/* category ddl fits here  */}
                <button onClick={props.toggleQR} disabled={props.disableQR}>{qrcode}</button>
            </div>
        </div>
    );
}