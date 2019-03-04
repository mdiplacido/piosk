import { ConfigActions, ConfigActionTypes } from "./config/actions";
import initialState from "./initial-state";
import { LoadStatusFeatures, ConfigStatus } from "./state";

export default function loadingReducer(state = initialState.loadStatus, action: ConfigActions): LoadStatusFeatures {
    switch (action.type) {
        case ConfigActionTypes.Load:
            return {
                ...state,
                config: {
                    ...state.config,
                    loading: true,
                    loaded: false,
                    failed: false,
                    error: null,
                    status: ConfigStatus.None
                }
            };

        case ConfigActionTypes.LoadFailure:
            return {
                ...state,
                config: {
                    ...state.config,
                    loading: false,
                    loaded: false,
                    failed: true,
                    error: action.error,
                    status: action.error && action.error.code === "ENOENT" ?
                        ConfigStatus.Missing :
                        ConfigStatus.Unknown
                }
            };

        case ConfigActionTypes.LoadSuccess:
            return {
                ...state,
                config: {
                    ...state.config,
                    loading: false,
                    loaded: true,
                    failed: false,
                    error: null,
                    status: ConfigStatus.Success
                }
            };

        case ConfigActionTypes.Save:
            return {
                ...state,
                config: {
                    ...state.config,
                    saving: true,
                    saved: false,
                    failed: false,
                    error: null,
                    status: ConfigStatus.None
                }
            };

        case ConfigActionTypes.SaveFailure:
            return {
                ...state,
                config: {
                    ...state.config,
                    saving: false,
                    saved: false,
                    failed: true,
                    error: action.error,
                    status: ConfigStatus.Unknown
                }
            };

        case ConfigActionTypes.SaveSuccess:
            return {
                ...state,
                config: {
                    ...state.config,
                    saving: false,
                    saved: true,
                    failed: false,
                    error: null,
                    status: ConfigStatus.Success
                }
            };

        default:
            return state;
    }
}