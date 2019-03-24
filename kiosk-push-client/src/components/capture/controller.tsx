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
        if (!props.config.all(false /* do not include capture */).length) {
            props.loggerActions.next(
                "CaptureController will not start, config is not ready, waiting for config...", LoggerSeverity.Info);

            return;
        }

        props.loggerActions.next(
            `initializing the capture service timer with ${props.config.settings.captureCheckIntervalSeconds} second interval`, LoggerSeverity.Info);

        const doWork = () => {
            props.loggerActions.next("checking for pending captures...", LoggerSeverity.Verbose);
            captureService.process(props.config, props.loggerActions);
        };

        // run immediate
        doWork();

        // setup checker
        const handle = window.setInterval(() => {
            doWork();
        }, props.config.settings.captureCheckIntervalSeconds * 1000);

        return () => {
            window.clearInterval(handle);
        };
    }, [props.config.settings]); // run on config changes

    return (
        <React.Fragment />
    );
};

// using both HOC and useContext in this file, for fun.
export default connect(null, mapLoggerActionsToProps)(withConfig(CaptureController));
