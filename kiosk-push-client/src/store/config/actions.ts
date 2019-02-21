import { ActionCreatorsMapObject, AnyAction, bindActionCreators, Dispatch } from "redux";

export enum ConfigActionTypes {
    Load = "CONFIG_LOAD",
    LoadSuccess = "CONFIG_LOAD_SUCCESS",
}

export interface ILoadConfigAction extends AnyAction {
    type: ConfigActionTypes.Load;
}

export interface ILoadConfigSuccessAction extends AnyAction {
    type: ConfigActionTypes.LoadSuccess;
}

export function loadConfig(): ILoadConfigAction {
    return {
        type: ConfigActionTypes.Load,
    };
}

export function loadConfigSuccess(): ILoadConfigSuccessAction {
    return {
        type: ConfigActionTypes.LoadSuccess
    };
}

export interface IConfigActionCreator extends ActionCreatorsMapObject<ConfigActions> {
    loadConfig: () => ILoadConfigAction;
    loadConfigSuccess: () => ILoadConfigSuccessAction;
}

export const ConfigActionCreatorFactory: () => IConfigActionCreator = () => ({
    loadConfig: loadConfig,
    loadConfigSuccess: loadConfigSuccess
});

export interface IConfigActionsProp {
    configActions: IConfigActionCreator;
}

export function mapConfigActionsToProps(dispatch: Dispatch): IConfigActionsProp {
    return {
        configActions: bindActionCreators(ConfigActionCreatorFactory(), dispatch)
    };
}

export type ConfigActions = ILoadConfigAction | ILoadConfigSuccessAction;
