import { ActionCreatorsMapObject, AnyAction, bindActionCreators, Dispatch } from "redux";

import { LoggerSeverity } from "../logger/actions";
import { INotification } from "./state";

export enum NotificationActionTypes {
    Next = "NOTIFICATION_NEXT",
    NextSuccess = "NOTIFICATION_NEXT_SUCCESS",
    Dismiss = "NOTIFICATION_DISMISS",
}

export interface INextNotificationAction extends AnyAction {
    type: NotificationActionTypes.Next;
    payload: INotification;
}

export interface IDismissNotificationAction extends AnyAction {
    type: NotificationActionTypes.Dismiss;
    id: number;
}

export function nextNotification(message: string, severity: LoggerSeverity): INextNotificationAction {
    return {
        type: NotificationActionTypes.Next,
        payload: {
            message,
            severity,
            stamp: new Date()
        }
    };
}

export function dismissNotification(sequenceId: number): IDismissNotificationAction {
    return {
        type: NotificationActionTypes.Dismiss,
        id: sequenceId,
    };
}

export interface INotificationActionCreator extends ActionCreatorsMapObject<NotificationActions> {
    next: (message: string, severity: LoggerSeverity) => INextNotificationAction;
    dismiss: (sequenceId: number) => IDismissNotificationAction;
}

export const NotificationActionCreatorFactory: () => INotificationActionCreator = () => ({
    next: nextNotification,
    dismiss: dismissNotification
});

export interface INotificationsActionsProp {
    notificationActions: INotificationActionCreator;
}

export function mapNotificationActionsToProps(dispatch: Dispatch): INotificationsActionsProp {
    return {
        notificationActions: bindActionCreators(NotificationActionCreatorFactory(), dispatch)
    };
}

export type NotificationActions = INextNotificationAction | IDismissNotificationAction;