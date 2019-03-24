import * as React from "react";
import IState from "../../store/state";
import selectConfig from "../../store/config/selectors";
import {
    ConfigState,
    ConfigStore,
    ICaptureConfig
    } from "./config";
import { connect } from "react-redux";
import { getDisplayName } from "../util";
import {
    IConfigActionsProp,
    mapConfigActionsToProps
    } from "../../store/config/actions";

// following "Provider pattern" here: https://github.com/sw-yx/react-typescript-cheatsheet

export interface ConfigConsumerProps {
    config: ConfigStore;
}

export interface ConfigProviderProps {
    config: ConfigState;
}

export const defaultConfig: ConfigState = {
    localPublishPath: "/var/jail/data/piosk_pickup/",
    enablePublishToDisk: true,
    enablePublishToSFTP: false,
    sftpPublishPath: "/data/piosk_pickup/",
    sftpUsername: "piosk_publisher",
    sftpAddress: "192.168.42.1",
    minAvailableSpaceOnPiPercent: 50 / 100,
    defaultPageSettleDelaySeconds: 30,
    maxLogFileSizeBytes: 1024 * 1024 * 10,
    maxLogLinesForDisplay: 1000,
    captureCheckIntervalSeconds: 30,
    captureConfigs: []
};

export const ConfigContext = React.createContext<ConfigStore>({} as ConfigStore);

export interface IConfigStateProps {
    config: ConfigState;
}

class ConfigProvider extends React.Component<ConfigProviderProps & IConfigActionsProp> implements ConfigStore {
    constructor(props: ConfigProviderProps & IConfigActionsProp) {
        super(props);
    }

    get settings(): ConfigState {
        return this.props.config &&
            Object.keys(this.props.config).length &&
            this.props.config || defaultConfig;
    }

    saveCaptureConfig = (config: ICaptureConfig) => {
        this.update({ captureConfigs: [config] });
    }

    update = (newState: Partial<ConfigState>, silent = false) => {
        const current = this.settings;
        const newCaptureConfigs = newState.captureConfigs || [];
        const currentCaptureConfigs = current.captureConfigs
            .filter(cc => newCaptureConfigs
                .every(ncc => ncc.name.toLowerCase() !== cc.name.toLowerCase()));

        const mergedState = {
            ...current,
            ...newState,
            captureConfigs: [
                ...currentCaptureConfigs,
                ...newCaptureConfigs
            ]
        };

        this.props.configActions.saveConfig(mergedState, silent);
    }

    all = (includeCapture = true) => {
        return Object
            .keys(this.settings)
            .filter(k => includeCapture || k !== "captureConfigs")
            .map(k => ({ key: k, value: this.settings[k] }));
    }

    captureConfigs = () => {
        return this.settings.captureConfigs;
    }

    render(): JSX.Element {
        const store: ConfigStore = {
            settings: this.settings,
            saveCaptureConfig: this.saveCaptureConfig,
            update: this.update,
            all: this.all,
            captureConfigs: this.captureConfigs,
        };

        return (
            <ConfigContext.Provider value={store}>
                {this.props.children}
            </ConfigContext.Provider>
        );
    }
}

export function withConfig<P extends Object = {}>(
    Component: React.ComponentClass<ConfigConsumerProps & P> | React.FC<ConfigConsumerProps & P>
): React.ComponentClass<Pick<P, Exclude<keyof P, keyof ConfigConsumerProps>>> {
    const c: React.RefForwardingComponent<typeof Component, ConfigConsumerProps & P> = (props: P) => {
        return (
            <ConfigContext.Consumer>
                {
                    config => <Component {...props} config={config} />
                }
            </ConfigContext.Consumer>
        );
    };

    c.displayName = `withConfig(${getDisplayName(Component)})`;
    return c as unknown as React.ComponentClass<Pick<P, Exclude<keyof P, keyof ConfigConsumerProps>>>;
}

function mapStateToProps(state: IState): ConfigProviderProps {
    return {
        config: selectConfig(state)
    } as ConfigProviderProps;
}

export default connect(mapStateToProps, mapConfigActionsToProps)(ConfigProvider);