import initialState from "../initial-state";
import { LoggerActions, LoggerActionTypes } from "./actions";

export default function reducer(state = initialState.logs, action: LoggerActions) {
    switch (action.type) {
        case LoggerActionTypes.Next:
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