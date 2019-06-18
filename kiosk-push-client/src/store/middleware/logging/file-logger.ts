import { Dispatch, Middleware, MiddlewareAPI, AnyAction } from "redux";

import IState from '../../state';
import { INextLogAction, isLogAction } from '../../logger/actions';

/**
 * The logging middleware type.
 * 
 * @public
 */
// tslint:disable-next-line: max-line-length
export type LoggingMiddleware = Middleware<unknown, IState, Dispatch<AnyAction>>;

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


                console.log(`got log event: ${action.payload.message}`);

                return result;
            };
}