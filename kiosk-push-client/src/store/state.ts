import ConfigState from "./config/state";

export enum ConfigStatus {
    None = "none",
    Unknown = "Unknown",
    Missing = "missing",
    Success = "success"
}

export interface IStoreEntityStatus<T extends string> {
    loading: boolean;
    loaded: boolean;
    saving: boolean;
    saved: boolean;
    failed: boolean;
    status: T;
    error?: any;
}

export type ConfigEntityStatus = IStoreEntityStatus<ConfigStatus>;

export interface LoadStatusFeatures {
    config: ConfigEntityStatus;
    // other features go here
}

export interface LoadStatusState {
    loadStatus: LoadStatusFeatures;
}

// tslint:disable-next-line:no-empty-interface
export default interface IState extends ConfigState, LoadStatusState {
}
