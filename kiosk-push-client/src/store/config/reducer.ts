import { ConfigState } from "../../providers/config/config";
import initialState from "../initial-state";
import { ConfigActions, ConfigActionTypes } from "./actions";

export default function configReducer(state = initialState.config, action: ConfigActions): ConfigState {
    switch (action.type) {
        case ConfigActionTypes.LoadSuccess: {
            return action.config;
        }

        default:
            return state;
    }
}