import {
    Button,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    withStyles,
} from "@material-ui/core";
import * as React from "react";
import { connect } from "react-redux";

import PageContainer from "../../components/common/page-container";
import containerStyles, { ContainerStyleProps } from "../../components/common/styles";
import { withConfig } from "../../providers/config/config.provider";
import {
    ILoggerActionsProp,
    LoggerSeverity,
    mapLoggerActionsToProps,
} from "../../store/logger/actions";
import logsSelector from "../../store/logger/selectors";
import { ILogEntry } from "../../store/logger/state";
import {
    INotificationsActionsProp,
    mapNotificationActionsToProps,
} from "../../store/notifications/actions";
import IState from "../../store/state";
import { combineActionPropMappers } from "../../store/utility";
import { useState } from "react";

type LogStateProps = { logs: ILogEntry[] };

type LogProps = ContainerStyleProps & LogStateProps;

type ConnectedLogProps = LogProps & ILoggerActionsProp & INotificationsActionsProp;

const Logs = (props: ConnectedLogProps) => {
    const { classes } = props;

    const severityValues = Object.values(LoggerSeverity);
    const [counter, setCounter] = useState(0);

    const dispatchTestLogMessage = () => props.loggerActions.next("Test message", LoggerSeverity.None);
    const dispatchTestNotification = () => {
        setCounter(counter + 1);
        props.notificationActions.next("Test message", severityValues[counter % severityValues.length]);
    };

    return (
        <PageContainer title="Logs">
            <Table className={classes.table}>
                <TableHead>
                    <TableRow>
                        <TableCell>Id</TableCell>
                        <TableCell>Severity</TableCell>
                        <TableCell>Time</TableCell>
                        <TableCell align="left">Message</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {props.logs.map(l => (
                        <TableRow key={l.sequence}>
                            <TableCell component="th" scope="row">
                                {l.sequence}
                            </TableCell>
                            <TableCell align="left">
                                {l.severity}
                            </TableCell>
                            <TableCell align="left">
                                {l.stamp.toString()}
                            </TableCell>
                            <TableCell align="left">
                                {l.message}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <br />
            <Button
                variant="contained"
                color="primary"
                onClick={dispatchTestLogMessage}>
                Test Logger
            </Button>
            &nbsp;
            <Button
                variant="contained"
                color="primary"
                onClick={dispatchTestNotification}>
                Test Notifications
            </Button>
        </PageContainer>
    );
};

function withStateProps(state: IState) {
    return {
        logs: logsSelector(state)
    };
}

const logsWithStyles = withStyles(containerStyles)(Logs);

const combinedActionMapper = combineActionPropMappers<ConnectedLogProps>(mapLoggerActionsToProps, mapNotificationActionsToProps);

export default connect(withStateProps, combinedActionMapper)(withConfig<LogProps | any>(logsWithStyles));
