import initialState from "./initial-state";
import { ConfigActions, ConfigActionTypes } from "./config/actions";

export default function loadingReducer(state = initialState.loadStatus, action: ConfigActions) {
    switch (action.type) {
        case ConfigActionTypes.Load:
            return {
                ...state,
                config: {
                    ...state.config,
                    loading: true,
                    loaded: false,
                    failed: false
                }
            };

        case ConfigActionTypes.LoadSuccess:
            return {
                ...state,
                config: {
                    ...state.config,
                    loading: false,
                    loaded: true,
                    failed: false
                }
            };

        default:
            return state;
    }
}