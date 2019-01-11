import * as React from 'react';
import { faChevronLeft, faChevronRight, faPause, faQrcode } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './navigation.css';

const back = <FontAwesomeIcon icon={faChevronLeft} />
const pause = <FontAwesomeIcon icon={faPause} />
const forward = <FontAwesomeIcon icon={faChevronRight} />
const qrcode = <FontAwesomeIcon icon={faQrcode} />

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
        console.log(event.currentTarget);
        props.toggleNav();
    }

    console.log('props: '+props.openNav+'; class: '+navigationClass); 
    return (
        <div 
            className={"navigation-center-container" + navigationClass}>
            <div className="navigation-container">
                <button onClick={props.back}>{back}</button>
                <button onClick={props.pause}>{pause}</button>
                <button onClick={props.forward}>{forward}</button>

                {/* category ddl fits here  */}
                <button>{qrcode}</button>

                <span onClick={handleOnClick}>x</span>
            </div>
        </div>
    );
}