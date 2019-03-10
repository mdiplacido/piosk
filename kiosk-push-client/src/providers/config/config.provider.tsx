// following "Provider pattern" here: https://github.com/sw-yx/react-typescript-cheatsheet
import * as React from "react";
import { connect } from "react-redux";

import { mapConfigActionsToProps, IConfigActionsProp } from "../../store/config/actions";
import selectConfig from "../../store/config/selectors";
import IState from "../../store/state";
import { getDisplayName } from "../util";
import { ConfigState, ConfigStore, UpdateConfigStateArg } from "./config";

export interface ConfigConsumerProps {
    config: ConfigStore;
}

export interface ConfigProviderProps {
    config: ConfigState;
}

const defaultConfig: ConfigState = {
    localPublishPath: "/var/jail/data/piosk_pickup/",
    enablePublishToDisk: true,
    enablePublishToSFTP: false,
    sftpPublishPath: "/data/piosk_pickup/",
    sftpUsername: "piosk_publisher",
    sftpAddress: "192.168.42.1",
    minAvailableSpaceOnPiPercent: 50 / 100,
    defaultPageSettleDelayMilliseconds: 30,
    maxLogFileSizeBytes: 1024 * 1024 * 10,
    maxLogLinesForDisplay: 1000,
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

    update = (newState: UpdateConfigStateArg) => {
        this.props.configActions.saveConfig(newState as Partial<ConfigState>);
    }

    all = (includeCapture = true) => {
        return Object
            .keys(this.settings)
            .filter(k => includeCapture || k !== "captureConfigs")
            .map(k => ({ key: k, value: this.settings[k] }));
    }

    render(): JSX.Element {
        const store: ConfigStore = {
            settings: this.settings,
            update: this.update,
            all: this.all
        };

        return (
            <ConfigContext.Provider value={store}>
                {this.props.children}
            </ConfigContext.Provider>
        );
    }
}

export function withConfig<T extends Object = {}>(
    Component: React.ComponentClass<ConfigConsumerProps & T> | React.FC<ConfigConsumerProps & T>
): React.RefForwardingComponent<typeof Component, ConfigConsumerProps & T> {
    const c: React.RefForwardingComponent<typeof Component, ConfigConsumerProps & T> = (props: T) => {
        return (
            <ConfigContext.Consumer>
                {
                    config => <Component {...props} config={config} />
                }
            </ConfigContext.Consumer>
        );
    };

    c.displayName = `withConfig(${getDisplayName(Component)})`;
    return c;
}

function mapStateToProps(state: IState): ConfigProviderProps {
    return {
        config: selectConfig(state)
    } as ConfigProviderProps;
}

export default connect(mapStateToProps, mapConfigActionsToProps)(ConfigProvider);