import initialState from "../initial-state";
import {
    ConfigActions,
    ConfigActionTypes
    } from "./actions";
import { ConfigState } from "../../providers/config/config";
import { defaultConfig } from "../../providers/config/config.provider";

export default function configReducer(state = initialState.config, action: ConfigActions): ConfigState {
    switch (action.type) {
        case ConfigActionTypes.LoadSuccess:
            // overlay onto default config in the event new config props come along that are not
            // covered by the config on disk.
            // TODO: should also consider removing "cruft config"
            return { ...defaultConfig, ...action.config };
        case ConfigActionTypes.SaveSuccess:
            return action.config;
        default:
            return state;
    }
}