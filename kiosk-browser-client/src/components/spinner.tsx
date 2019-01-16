import * as React from 'react';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './spinner.scss';

export interface ISpinnerProps {
    spin?: boolean;
    text?: string;
}

export const Spinner = (props: ISpinnerProps) => {
    return (
        <div className="spinner-box">
            <div className="center">
                <FontAwesomeIcon icon={faSpinner} size="5x" spin={props.spin} />
            </div>
            <div className="text center" hidden={!props.text}>
                {props.text}
            </div>
        </div>
    );
}