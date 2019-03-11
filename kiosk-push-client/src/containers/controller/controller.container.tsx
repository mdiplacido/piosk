import * as React from "react";
import AddIcon from "@material-ui/icons/Add";
import CaptureCard from "../../components/capture/card";
import containerStyles from "../../components/common/styles";
import PageContainer from "../../components/common/page-container";
import {
    ConfigConsumerProps,
    withConfig
    } from "../../providers/config/config.provider";
import {
    createStyles,
    Fab,
    Theme,
    Tooltip,
    WithStyles,
    withStyles
    } from "@material-ui/core";
import {
    useEffect,
    useState
    } from "react";

export interface ControllerContainerProps extends ConfigConsumerProps, WithStyles<typeof styles> {
}

const styles = (theme: Theme) => createStyles({
    fab: {
        margin: theme.spacing.unit * 2,
    },
    absolute: {
        position: "absolute",
        bottom: theme.spacing.unit * 3,
        right: theme.spacing.unit * 3,
    },
    ...containerStyles(theme)
});

const ControllerContainer = (props: ControllerContainerProps) => {
    const [now, setNow] = useState(new Date());
    const { classes } = props;

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
            <Tooltip title="Add" aria-label="Add" onClick={() => alert("Todo add modal")}>
                <Fab color="secondary" className={classes.absolute}>
                    <AddIcon />
                </Fab>
            </Tooltip>
        </PageContainer>
    );
};

export default withConfig(withStyles(styles)(ControllerContainer));
