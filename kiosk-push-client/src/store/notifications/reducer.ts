import initialState from "../initial-state";
import { NotificationActions, NotificationActionTypes } from "./actions";

export default function reducer(state = initialState.notifications, action: NotificationActions) {
    switch (action.type) {
        case NotificationActionTypes.Next:
            return {
                ...state,
                nextSequenceId: state.nextSequenceId + 1,
                entries: [{ ...action.payload, dismissed: false, sequence: state.nextSequenceId }, ...state.entries.slice(0, 2)]
            };
        case NotificationActionTypes.Dismiss:
            return {
                ...state,
                entries: state.entries.map(n => n.sequence === action.id ? { ...n, dismissed: true } : n)
            };
        default:
            return state;
    }
}