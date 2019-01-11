import * as React from 'react';
import { faChevronLeft, faChevronRight, faPause, faQrcode, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './navigation.css';

const back = <FontAwesomeIcon icon={faChevronLeft} />
const pause = <FontAwesomeIcon icon={faPause} />
const forward = <FontAwesomeIcon icon={faChevronRight} />
const qrcode = <FontAwesomeIcon icon={faQrcode} />
const close = <FontAwesomeIcon icon={faTimesCircle} />

export interface INavigation {
  openNav: boolean;
  toggleNav: ()=> void;
  back: () => void;
  forward: () => void;
  pause: () => void;
}

export const Navigation = (props: INavigation)=> {
    const navigationClass = props.openNav? ' open' : ' close'; 
    function handleOnClick(event:any){
        event.preventDefault();
        props.toggleNav();
    }

    return (
        <div 
            className={"navigation-center-container" + navigationClass}>
            <div className="navigation-container">
                <span className='close-button' onClick={handleOnClick}>{close}</span>

                <button onClick={props.back}>{back}</button>
                <button onClick={props.pause}>{pause}</button>
                <button onClick={props.forward}>{forward}</button>

                {/* category ddl fits here  */}
                <button>{qrcode}</button>
            </div>
        </div>
    );
}