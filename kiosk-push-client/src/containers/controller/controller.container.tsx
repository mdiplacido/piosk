import { withStyles } from "@material-ui/core";
import * as React from "react";
import { useEffect, useState } from "react";

import CaptureCard from "../../components/capture/card";
import PageContainer from "../../components/common/page-container";
import containerStyles, { ContainerStyleProps } from "../../components/common/styles";
import { ConfigConsumerProps, withConfig } from "../../providers/config/config.provider";

export interface ControllerContainerProps extends ContainerStyleProps, ConfigConsumerProps {
}

const ControllerContainer = (props: ControllerContainerProps) => {
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        // tick now every 1 second.
        const timer = window.setInterval(() => setNow(new Date()), 1000);
        return () => {
            window.clearInterval(timer);
        };
    }, []);  // empty array runs effect only on mount.

    return (
        <PageContainer title="Controller">
            {
                props.config
                    .captureConfigs()
                    .map(capture =>
                        <React.Fragment key={capture.name}>
                            <CaptureCard captureConfig={capture} now={now} />
                            <br />
                        </React.Fragment>
                    )
            }
        </PageContainer>
    );
};

export default withConfig(withStyles(containerStyles)(ControllerContainer));
