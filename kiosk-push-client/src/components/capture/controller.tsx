import * as React from "react";
import { CaptureServiceContext } from "../../providers/capture-service/provider";
import {
    ConfigConsumerProps,
    withConfig
} from "../../providers/config/config.provider";
import {
    useContext,
    useEffect,
} from "react";

const CaptureController = (props: ConfigConsumerProps) => {
    const captureService = useContext(CaptureServiceContext);

    useEffect(() => {
        console.log("initializing the capture service timer");
        const handle = window.setInterval(() => {
            console.log("checking for pending captures...");
            captureService.process(props.config);
        }, 2000);

        return () => {
            window.clearInterval(handle);
        };
    }, []); // no-deps, just run once

    return (
        <React.Fragment />
    );
};

// using both HOC and useContext in this file, for fun.
export default withConfig(CaptureController);
