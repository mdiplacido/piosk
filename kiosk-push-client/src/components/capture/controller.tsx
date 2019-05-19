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
    const [hasRunImmediate, setHasRunImmediate] = React.useState(false);

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
        // TODO: had to do this because a change to the config was causing the effect to run again
        // without realizing the last run date change. Need a cleaner way.
        // we might be able to bring this back now that we are managing redux properly.  by bring this
        // back I mean let the immediate run after any state change, not just the first.
        if (!hasRunImmediate) {
            setHasRunImmediate(true);
            doWork();
        }

        // setup checker
        const handle = window.setInterval(() => {
            doWork();
        }, props.config.settings.captureCheckIntervalSeconds * 1000);

        return () => {
            props.loggerActions.next("Destroying work interval timer...", LoggerSeverity.Info);
            // destroy interval checker
            window.clearInterval(handle);
        };
    }, [props.config.settings.captureConfigs]); // run on capture config changes only

    return (
        <React.Fragment />
    );
};

// using both HOC and useContext in this file, for fun.
export default connect(null, mapLoggerActionsToProps)(withConfig(CaptureController));
