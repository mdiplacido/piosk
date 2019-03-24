import {
    ActionCreatorsMapObject,
    AnyAction,
    bindActionCreators,
    Dispatch
    } from "redux";
import { ConfigState } from "../../providers/config/config";

export enum ConfigActionTypes {
    Load = "CONFIG_LOAD",
    LoadSuccess = "CONFIG_LOAD_SUCCESS",
    LoadFailure = "CONFIG_LOAD_FAILURE",

    Save = "CONFIG_SAVE",
    SaveSuccess = "CONFIG_SAVE_SUCCESS",
    SaveFailure = "CONFIG_SAVE_FAILURE",
}

export interface ILoadConfigAction extends AnyAction {
    type: ConfigActionTypes.Load;
}

export interface ILoadConfigSuccessAction extends AnyAction {
    type: ConfigActionTypes.LoadSuccess;
    config: ConfigState;
}

export interface ILoadConfigFailureAction extends AnyAction {
    type: ConfigActionTypes.LoadFailure;
    error: any;
}

export interface ISaveConfigAction extends AnyAction {
    type: ConfigActionTypes.Save;
    config: ConfigState;
    silent?: boolean;
}

export interface ISaveConfigSuccessAction extends AnyAction {
    type: ConfigActionTypes.SaveSuccess;
    config: ConfigState;
}

export interface ISaveConfigFailureAction extends AnyAction {
    type: ConfigActionTypes.SaveFailure;
    error: any;
}

export function loadConfig(): ILoadConfigAction {
    return {
        type: ConfigActionTypes.Load,
    };
}

export function loadConfigSuccess(config: ConfigState): ILoadConfigSuccessAction {
    return {
        type: ConfigActionTypes.LoadSuccess,
        config
    };
}

export function loadConfigFailure(error: any): ILoadConfigFailureAction {
    return {
        type: ConfigActionTypes.LoadFailure,
        error
    };
}

export function saveConfig(config: ConfigState, silent = false): ISaveConfigAction {
    return {
        type: ConfigActionTypes.Save,
        config,
        silent
    };
}

export function saveConfigSuccess(config: ConfigState): ISaveConfigSuccessAction {
    return {
        type: ConfigActionTypes.SaveSuccess,
        config
    };
}

export function saveConfigFailure(error: any): ISaveConfigFailureAction {
    return {
        type: ConfigActionTypes.SaveFailure,
        error
    };
}

export interface IConfigActionCreator extends ActionCreatorsMapObject<ConfigActions> {
    loadConfig: () => ILoadConfigAction;
    saveConfig: (state: ConfigState, silent?: boolean) => ISaveConfigAction;
}

export const ConfigActionCreatorFactory: () => IConfigActionCreator = () => ({
    loadConfig,
    saveConfig,
});

export interface IConfigActionsProp {
    configActions: IConfigActionCreator;
}

export function mapConfigActionsToProps(dispatch: Dispatch): IConfigActionsProp {
    return {
        configActions: bindActionCreators(ConfigActionCreatorFactory(), dispatch)
    };
}

export type ConfigActions =
    ILoadConfigAction | ILoadConfigSuccessAction | ILoadConfigFailureAction |
    ISaveConfigAction | ISaveConfigSuccessAction | ISaveConfigFailureAction;