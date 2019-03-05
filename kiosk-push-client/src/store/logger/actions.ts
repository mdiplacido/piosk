import { ActionCreatorsMapObject, AnyAction, bindActionCreators, Dispatch } from "redux";

export enum LoggerActionTypes {
    Next = "LOGGER_NEXT",
}

export enum LoggerSeverity {
    None = "None",
    Verbose = "Verbose",
    Warning = "Warning",
    Info = "Info",
    Error = "Error"
}

export interface INextLogAction extends AnyAction {
    type: LoggerActionTypes.Next;
    payload: {
        message: string;
        severity: LoggerSeverity;
        stamp: Date;
    };
}

export function nextLogMessage(message: string, severity: LoggerSeverity): INextLogAction {
    return {
        type: LoggerActionTypes.Next,
        payload: {
            message,
            severity,
            stamp: new Date()
        }
    };
}

export interface ILoggerActionCreator extends ActionCreatorsMapObject<LoggerActions> {
    next: (message: string, severity: LoggerSeverity) => INextLogAction;
}

export const LoggerActionCreatorFactory: () => ILoggerActionCreator = () => ({
    next: nextLogMessage
});

export interface ILoggerActionsProp {
    loggerActions: ILoggerActionCreator;
}

export function mapLoggerActionsToProps(dispatch: Dispatch): ILoggerActionsProp {
    return {
        loggerActions: bindActionCreators(LoggerActionCreatorFactory(), dispatch)
    };
}

export type LoggerActions = INextLogAction;