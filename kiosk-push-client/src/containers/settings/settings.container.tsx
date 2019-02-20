import * as React from "react";

import {
    ConfigContext,
    ConfigProviderProps,
    withConfig,
} from "../../providers/config/config.provider";
import { ConfigStore } from "../../providers/config/config";

export interface SettingsProps extends ConfigProviderProps {
}

let counter = 0;

const Settings = (props: SettingsProps) => {
    const updateConfig = () => {
        props.config.update({ sftpUsername: "marco" + (++counter) } as any);
    };

    return (
        <ConfigContext.Consumer>
            {
                (config: ConfigStore) => {
                    return (<div>
                        {JSON.stringify(config.state)}
                        {JSON.stringify(props.config.state)}

                        <br />

                        <button onClick={updateConfig}>Change</button>
                    </div>);
                }
            }
        </ConfigContext.Consumer>
    );
};

export default withConfig(Settings);
