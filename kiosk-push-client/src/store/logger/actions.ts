import { ActionCreatorsMapObject, AnyAction, bindActionCreators, Dispatch } from "redux";

import { ILogEntry } from "./state";

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
    payload: ILogEntry;
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

export function isLogAction(action: AnyAction): boolean {
    return !!action && action.type === LoggerActionTypes.Next;
}

export type LoggerActions = INextLogAction;