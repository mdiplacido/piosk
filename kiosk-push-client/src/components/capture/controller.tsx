import * as React from "react";
import { CaptureServiceContext } from "../../providers/capture-service/provider";
import {
    ConfigConsumerProps,
    withConfig
    } from "../../providers/config/config.provider";
import { connect } from "react-redux";
import {
    ILoggerActionsProp,
    mapLoggerActionsToProps,
    LoggerSeverity
    } from "../../store/logger/actions";
import {
    useContext,
    useEffect
    } from "react";

type CaptureControllerProps = ILoggerActionsProp & ConfigConsumerProps;

const CaptureController = (props: CaptureControllerProps) => {
    const captureService = useContext(CaptureServiceContext);

    useEffect(() => {
        props.loggerActions.next("initializing the capture service timer", LoggerSeverity.Info);

        const handle = window.setInterval(() => {
            props.loggerActions.next("checking for pending captures...", LoggerSeverity.Verbose);
            captureService.process(props.config, props.loggerActions);
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
export default connect(null, mapLoggerActionsToProps)(withConfig(CaptureController));
