import initialState from "../initial-state";
import { LoggerActions, LoggerActionTypes } from "./actions";

export default function reducer(state = initialState.logs, action: LoggerActions) {
    switch (action.type) {
        case LoggerActionTypes.Next:
            return [action.payload, ...state.slice(0, 9)];
        default:
            return state;
    }
}