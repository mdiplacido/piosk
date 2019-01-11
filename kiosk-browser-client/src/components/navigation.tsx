import * as React from 'react';
import { faPause, faStepBackward, faStepForward } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './navigation.css';

const back = <FontAwesomeIcon icon={faStepBackward} size="2x" pull="left" />
const pause = <FontAwesomeIcon icon={faPause} size="2x" className="fl" />
const forward = <FontAwesomeIcon icon={faStepForward} size="2x" pull="right" />

export interface INavigation {
    back: () => void;
    forward: () => void;
    pause: () => void;
}

export const Navigation = (props: INavigation) => {
    return (
        <div className="navigation-center-container">
            <div className="navigation-container">
                <button id="back-button" onClick={props.back}>{back}</button>
                <button id="pause-button" onClick={props.pause}>{pause}</button>
                <button id="forward-button" onClick={props.forward}>{forward}</button>
            </div>
        </div>
    );
}