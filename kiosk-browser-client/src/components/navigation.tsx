import * as React from 'react';

export interface INavigation {
    back: () => void;
    forward: () => void;
    pause: () => void;
}

export const Navigation = (props: INavigation) => {
    return (
        <div className="navigation-container">
            <button onClick={props.back}>Back</button>
            <button onClick={props.pause}>Pause</button>
            <button onClick={props.forward}>Forward</button>
        </div>
    );
}