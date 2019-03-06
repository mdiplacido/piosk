import initialState from "../initial-state";
import { LoggerActions, LoggerActionTypes } from "./actions";
import { NotificationActionTypes, NotificationActions } from "../notifications/actions";

export default function reducer(state = initialState.logs, action: LoggerActions | NotificationActions) {
    switch (action.type) {
        // notification & log actions are really the same.
        case LoggerActionTypes.Next:
        case NotificationActionTypes.Next:
            return {
                ...state,
                nextSequenceId: state.nextSequenceId + 1,
                entries: [
                    {
                        ...action.payload,
                        sequence: state.nextSequenceId
                    },
                    ...state.entries.slice(0, 9)
                ]
            };
        default:
            return state;
    }
}