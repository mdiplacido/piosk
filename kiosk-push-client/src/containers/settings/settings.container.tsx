import * as React from "react";

import PageContainer from "../../components/common/page-container";
import { ConfigProviderProps, withConfig } from "../../providers/config/config.provider";

export interface SettingsProps extends ConfigProviderProps {
}

let counter = 0;

const Settings = (props: SettingsProps) => {
    const updateConfig = () => {
        props.config.update({ sftpUsername: "marco" + (++counter) } as any);
    };

    return (
        <PageContainer title="Settings">
            {JSON.stringify(props.config.state)}
            <br />
            <button onClick={updateConfig}>Change</button>
        </PageContainer>
    );
};

export default withConfig(Settings);
