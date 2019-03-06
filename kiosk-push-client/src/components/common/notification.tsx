import {
    IconButton,
    Snackbar,
    SnackbarContent,
    Theme,
    WithStyles,
    withStyles,
} from "@material-ui/core";
import { amber, green } from "@material-ui/core/colors";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import CloseIcon from "@material-ui/icons/Close";
import ErrorIcon from "@material-ui/icons/Error";
import InfoIcon from "@material-ui/icons/Info";
import WarningIcon from "@material-ui/icons/Warning";
import classNames from "classnames";
import * as React from "react";
import { connect } from "react-redux";

import { LoggerSeverity } from "../../store/logger/actions";
import {
    INotificationsActionsProp,
    mapNotificationActionsToProps,
} from "../../store/notifications/actions";
import { activeNotifications } from "../../store/notifications/selectors";
import { INotification } from "../../store/notifications/state";
import IState from "../../store/state";

interface NotificationProps {
    activeNotifications: INotification[];
}

const variantIcon = {
    success: CheckCircleIcon,
    warning: WarningIcon,
    error: ErrorIcon,
    info: InfoIcon,
};

const styles1 = (theme: Theme) => ({
    close: {

    },
    success: {
        backgroundColor: green[600],
    },
    error: {
        backgroundColor: theme.palette.error.dark,
    },
    info: {
        backgroundColor: theme.palette.primary.dark,
    },
    warning: {
        backgroundColor: amber[700],
    },
    icon: {
        fontSize: 20,
    },
    iconVariant: {
        opacity: 0.9,
        marginRight: theme.spacing.unit,
    },
    message: {
        display: "flex",
        alignItems: "center",
    },
});

type Variant = "success" | "warning" | "error" | "info";

type CustomSnackbarContentProps = WithStyles<typeof styles1> & {
    onClose: () => void;
    variant: Variant,
    message: string;
    className: string;
};

const SeverityToVariant: Map<LoggerSeverity, Variant> = new Map(
    [
        [LoggerSeverity.Error, "error" as Variant],
        [LoggerSeverity.Info, "info" as Variant],
        [LoggerSeverity.Warning, "warning" as Variant],
    ]
);

const CustomSnackbarContent = (props: CustomSnackbarContentProps) => {
    const { classes, className, message, onClose, variant, ...other } = props;
    const Icon = variantIcon[variant];

    return (
        <SnackbarContent
            className={classNames(classes[variant], className)}
            aria-describedby="client-snackbar"
            message={
                <span id="client-snackbar" className={classes.message}>
                    <Icon className={classNames(classes.icon, classes.iconVariant)} />
                    {message}
                </span>
            }
            action={[
                <IconButton
                    key="close"
                    aria-label="Close"
                    color="inherit"
                    className={classes.close}
                    onClick={onClose}
                >
                    <CloseIcon className={classes.icon} />
                </IconButton>,
            ]}
            {...other}
        />
    );
};

const CustomSnackbarContentWrapper = withStyles(styles1)(CustomSnackbarContent);

const Notification = (props: NotificationProps & INotificationsActionsProp & WithStyles<typeof styles2>) => {
    const clearSnack = (sequence: number) => props.notificationActions.dismiss(sequence);
    const { classes } = props;

    return (
        <React.Fragment>
            {
                props.activeNotifications
                    .map(n =>
                        <Snackbar
                            key={n.sequence}
                            anchorOrigin={{
                                vertical: "bottom",
                                horizontal: "left",
                            }}
                            open={true}>
                            <CustomSnackbarContentWrapper
                                onClose={() => clearSnack(n.sequence as number)}
                                variant={SeverityToVariant.get(n.severity) || "success"}
                                className={classes.margin}
                                message={n.message} />
                        </Snackbar>)
            }
        </React.Fragment>
    );
};

function mapStateToProps(state: IState) {
    return {
        activeNotifications: activeNotifications(state)
    };
}

const styles2 = (theme: Theme) => ({
    margin: {
        margin: theme.spacing.unit,
    },
});

export default withStyles(styles2)(connect(mapStateToProps, mapNotificationActionsToProps)(Notification));