// following "Provider pattern" here: https://github.com/sw-yx/react-typescript-cheatsheet
import * as React from "react";

import { ConfigState, ConfigStore, UpdateConfigStateArg } from "./config";
import { getDisplayName } from "../util";

export interface ConfigProviderProps {
    config: ConfigStore;
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
    maxLogLinesForDisplay: 1000
};

export const ConfigContext = React.createContext<ConfigStore>({} as ConfigStore);

class ConfigProvider extends React.Component<{}, ConfigState> implements ConfigStore {
    constructor(props: {}) {
        super(props);
        this.state = defaultConfig;
    }

    update = (newState: UpdateConfigStateArg) => {
        this.setState(newState);
    }

    render(): JSX.Element {
        const store: ConfigStore = {
            state: this.state,
            update: this.update
        };

        return (
            <ConfigContext.Provider value={store}>
                {this.props.children}
            </ConfigContext.Provider>
        );
    }
}

export function withConfig<T extends Object = {}>(
    Component: React.ComponentClass<ConfigProviderProps & T> | React.FC<ConfigProviderProps & T>
): React.RefForwardingComponent<typeof Component, ConfigProviderProps & T> {
    const c: React.RefForwardingComponent<typeof Component, ConfigProviderProps & T> = (props: T) => {
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

export default ConfigProvider;