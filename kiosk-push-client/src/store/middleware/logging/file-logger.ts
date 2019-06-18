import { Dispatch, Middleware, MiddlewareAPI, AnyAction } from "redux";

import IState from '../../state';
import { INextLogAction, isLogAction } from '../../logger/actions';

import { FileLogger } from 'kiosk-common';
import * as log4js from 'log4js';

/**
 * The logging middleware type.
 * 
 * @public
 */
// tslint:disable-next-line: max-line-length
export type LoggingMiddleware = Middleware<unknown, IState, Dispatch<AnyAction>>;

// TODO: this block should be in a function
const fileLog = log4js
    .configure({
        appenders: { piosk: { type: 'file', filename: 'push-client.log', maxLogSize: 1024 ** 2, backups: 5 } },
        categories: { default: { appenders: ['piosk'], level: 'ALL' } }
    });

const fileLogImpl = fileLog.getLogger();

const fileLogger = new FileLogger(fileLogImpl, "Main");

export function createLoggingMiddleware(): LoggingMiddleware {
    return (_store: MiddlewareAPI<Dispatch<AnyAction>, IState>) =>
        (next: Dispatch<INextLogAction>) =>
            (action: INextLogAction) => {
                // first we run the action change as we want the 
                // reducer to run first and the we call the listeners so we 
                // guaranteed to see the most recently reduced state.
                const result = next(action)

                // check to see if we have a log action.
                if (!isLogAction(action)) {
                    return result;
                }

                // console.log(`got log event: ${action.payload.message}`);
                // TODO: map the log events to the proper log function.
                fileLogger.log(action.payload.message);

                return result;
            };
}