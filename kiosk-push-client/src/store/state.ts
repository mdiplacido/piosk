import ConfigState from "./config/state";

export enum ConfigStatus {
    None = "none",
    Missing = "missing",
    Success = "success"
}

export interface IStoreEntityStatus<T extends string> {
    loading: boolean;
    loaded: boolean;
    failed: boolean;
    status: T;
}

export type ConfigEntityStatus = IStoreEntityStatus<ConfigStatus>;

// tslint:disable-next-line:no-empty-interface
export default interface IState extends ConfigState {
    loadStatus: {
        config: ConfigEntityStatus
    };
}
