import { Table, TableBody, TableCell, TableHead, TableRow, withStyles } from "@material-ui/core";
import * as React from "react";
import { connect } from "react-redux";

import PageContainer from "../../components/common/page-container";
import containerStyles, { ContainerStyleProps } from "../../components/common/styles";
import { PublisherCompletionStatus } from "../../providers/capture-publisher/publisher.provider";

export interface UploadsProps {
}

const Uploads = (props: UploadsProps & ContainerStyleProps) => {
    const { classes } = props;

    return (
        <PageContainer title="Uploads">
            <Table className={classes.table}>
                <TableHead>
                    <TableRow>
                        <TableCell>Upload id</TableCell>
                        <TableCell align="left">Size</TableCell>
                        <TableCell align="left">Source</TableCell>
                        <TableCell align="left">Status</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {[{ key: "upload1", size: 1024 ** 2, source: "Google", status: PublisherCompletionStatus.None }]
                        .map(c => (
                            <TableRow key={c.key}>
                                <TableCell component="th" scope="row">
                                    {c.key}
                                </TableCell>
                                <TableCell component="th" scope="row">
                                    {c.size}
                                </TableCell>
                                <TableCell component="th" scope="row">
                                    {c.source}
                                </TableCell>
                                <TableCell component="th" scope="row">
                                    {c.status}
                                </TableCell>
                            </TableRow>
                        ))}
                </TableBody>
            </Table>
            <br />
        </PageContainer>
    );
};

export default connect()(withStyles(containerStyles)(Uploads));
