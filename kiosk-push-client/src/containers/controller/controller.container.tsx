import { withStyles } from "@material-ui/core";
import * as React from "react";
import CaptureCard from "../../components/capture/card";
import PageContainer from "../../components/common/page-container";
import containerStyles, { ContainerStyleProps } from "../../components/common/styles";
import { ConfigConsumerProps, withConfig } from "../../providers/config/config.provider";

export interface ControllerContainerProps extends ContainerStyleProps, ConfigConsumerProps {
}

const ControllerContainer = (props: ControllerContainerProps) => {
    return (
        <PageContainer title="Controller">
            {
                props.config
                    .captureConfigs()
                    .map(capture => <CaptureCard key={capture.name} captureConfig={capture} />)
            }
        </PageContainer>
    );
};

export default withConfig(withStyles(containerStyles)(ControllerContainer));
