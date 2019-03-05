import { Table, TableBody, TableCell, TableHead, TableRow, withStyles } from "@material-ui/core";
import * as React from "react";
import { connect } from "react-redux";

import PageContainer from "../../components/common/page-container";
import containerStyles, { ContainerStyleProps } from "../../components/common/styles";
import { withConfig } from "../../providers/config/config.provider";
import logsSelector from "../../store/logger/selectors";
import { ILogEntry } from "../../store/logger/state";
import IState from "../../store/state";

type LogStateProps = { logs: ILogEntry[] };

type LogProps = ContainerStyleProps & LogStateProps;

const Logs = (props: LogProps) => {
    const { classes } = props;
    return (
        <PageContainer title="Logs">
            <Table className={classes.table}>
                <TableHead>
                    <TableRow>
                        <TableCell>Id</TableCell>
                        <TableCell>Severity</TableCell>
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
                                {l.message}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </PageContainer>
    );
};

function withStateProps(state: IState) {
    return {
        logs: logsSelector(state)
    };
}

const logsWithStyles = withStyles(containerStyles)(Logs);

export default connect(withStateProps)(withConfig<LogProps | any>(logsWithStyles));
