import { ActionCreatorsMapObject, AnyAction, bindActionCreators, Dispatch } from "redux";
import { ConfigState } from "../../providers/config/config";

export enum ConfigActionTypes {
    Load = "CONFIG_LOAD",
    LoadSuccess = "CONFIG_LOAD_SUCCESS",
    LoadFailure = "CONFIG_LOAD_FAILURE",
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

export interface IConfigActionCreator extends ActionCreatorsMapObject<ConfigActions> {
    loadConfig: () => ILoadConfigAction;
}

export const ConfigActionCreatorFactory: () => IConfigActionCreator = () => ({
    loadConfig: loadConfig
});

export interface IConfigActionsProp {
    configActions: IConfigActionCreator;
}

export function mapConfigActionsToProps(dispatch: Dispatch): IConfigActionsProp {
    return {
        configActions: bindActionCreators(ConfigActionCreatorFactory(), dispatch)
    };
}

export type ConfigActions = ILoadConfigAction | ILoadConfigSuccessAction | ILoadConfigFailureAction;
