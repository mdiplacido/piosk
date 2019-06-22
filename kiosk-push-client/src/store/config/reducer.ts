import initialState from "../initial-state";
import {
    CaptureStatus,
    ICaptureConfig
    } from "./../../providers/config/config";
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
            // we will use the current action state or the current state.
            return action.config || state;
        case ConfigActionTypes.SaveCaptureStatus: {
            const toUpdate = state.captureConfigs.find(c => c.name === action.payload.captureName) as ICaptureConfig;
            return {
                ...state,
                captureConfigs: [
                    ...state.captureConfigs.filter(c => c.name !== toUpdate.name),
                    {
                        ...toUpdate,
                        lastCapture: action.payload.captureStatus === CaptureStatus.Captured && new Date() || toUpdate.lastCapture,
                        additionalData: {
                            ...toUpdate.additionalData,
                            status: action.payload.captureStatus
                        }
                    }
                ]
            };
        }
        default:
            return state;
    }
}