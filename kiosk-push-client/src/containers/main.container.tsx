import * as React from 'react';
import { Controller } from '../App';
import { ChangeEvent } from 'react';

export interface MainContainerProps {
    url: string;
    controller: Controller;
}

const MainContainer = (props: MainContainerProps) => {
    const { controller, url } = props;

    const handleOnUrlChange = (event: ChangeEvent<HTMLInputElement>) => {
        controller.urlChange(event.target.value);
    };

    return (
        <div>
            <h2>POC for screen capture panel</h2>

            current url: {url}
            <br />
            <button onClick={controller.screenshot}>Screenshot</button>
            <br />
            <button onClick={controller.openWindow}>Open new window</button>
            <br />
            <button onClick={controller.loadUrl}>Refresh</button>
            <br />
            <button onClick={controller.maximize}>Maximize</button>
            <br />
            <input type='text' onChange={handleOnUrlChange} />
        </div>
    );
};

export default MainContainer;
