import { Button, Table, TableBody, TableCell, TableHead, TableRow, withStyles } from "@material-ui/core";
import * as React from "react";
import { connect } from "react-redux";

import PageContainer from "../../components/common/page-container";
import containerStyles, { ContainerStyleProps } from "../../components/common/styles";
import { withConfig } from "../../providers/config/config.provider";
import { ILoggerActionsProp, mapLoggerActionsToProps, LoggerSeverity } from "../../store/logger/actions";
import logsSelector from "../../store/logger/selectors";
import { ILogEntry } from "../../store/logger/state";
import IState from "../../store/state";

type LogStateProps = { logs: ILogEntry[] };

type LogProps = ContainerStyleProps & LogStateProps;

const Logs = (props: LogProps & ILoggerActionsProp) => {
    const { classes } = props;

    const dispatchTestLogMessage = () => props.loggerActions.next("Test message", LoggerSeverity.None);

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
                Test
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

export default connect(withStateProps, mapLoggerActionsToProps)(withConfig<LogProps | any>(logsWithStyles));
