import * as log4js from "log4js";
import IState from "../../state";
import {
    AnyAction,
    Dispatch,
    Middleware,
    MiddlewareAPI
    } from "redux";
import {
    FileLogger,
    Logger
    } from "kiosk-common";
import {
    INextLogAction,
    isLogAction,
    LoggerSeverity
    } from "../../logger/actions";

function getWriter(logger: Logger, event: INextLogAction) {
    switch (event.payload.severity) {
        case LoggerSeverity.Error:
            return logger.error;
        case LoggerSeverity.Info:
            return logger.info;
        case LoggerSeverity.Verbose:
            return logger.verbose;
        case LoggerSeverity.Warning:
            return logger.warn;
        default:
            return logger.log;
    }
}

function log(logger: Logger, event: INextLogAction): void {
    const writer = getWriter(logger, event);
    // TODO: use a scoped logger from data in the INextLogAction.
    writer.apply(logger, [event.payload.message]);
}

/**
 * The logging middleware type.
 *
 * @public
 */
// tslint:disable-next-line: max-line-length
export type LoggingMiddleware = Middleware<unknown, IState, Dispatch<AnyAction>>;

export function createLogger(): Logger {
    const fileLog = log4js
        .configure({
            appenders: { piosk: { type: "file", filename: "push-client.log", maxLogSize: 1024 ** 2, backups: 5 } },
            categories: { default: { appenders: ["piosk"], level: "ALL" } }
        });

    const fileLogImpl = fileLog.getLogger();

    return new FileLogger(fileLogImpl, "Main");
}

export function createLoggingMiddleware(logger: Logger): LoggingMiddleware {
    return (_store: MiddlewareAPI<Dispatch<AnyAction>, IState>) =>
        (next: Dispatch<INextLogAction>) =>
            (action: INextLogAction) => {
                // first we run the action change as we want the
                // reducer to run first and the we call the listeners so we
                // guaranteed to see the most recently reduced state.
                const result = next(action);

                // check to see if we have a log action.
                if (!isLogAction(action)) {
                    return result;
                }

                // console.log(`got log event: ${action.payload.message}`);
                log(logger, action);

                return result;
            };
}