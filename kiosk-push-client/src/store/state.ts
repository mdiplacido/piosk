import ConfigState from "./config/state";

// tslint:disable-next-line:no-empty-interface
export interface IState extends ConfigState {
    loadStatus: {
        config: {
            loading: boolean;
            loaded: boolean;
            failed: boolean;
        }
    }
}
