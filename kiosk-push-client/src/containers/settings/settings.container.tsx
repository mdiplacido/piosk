import { Table, TableBody, TableCell, TableHead, TableRow, withStyles, Button } from "@material-ui/core";
import * as React from "react";

import PageContainer from "../../components/common/page-container";
import containerStyles, { ContainerStyleProps } from "../../components/common/styles";
import { ConfigConsumerProps, withConfig } from "../../providers/config/config.provider";

export interface SettingsProps extends ConfigConsumerProps {
}

const Settings = (props: SettingsProps & ContainerStyleProps) => {
    const { classes, config } = props;

    const onSave = () => {
        config.update({
            localPublishPath: "bob",
            maxLogFileSizeBytes: 1024
        });
    };

    return (
        <PageContainer title="Settings">
            <Table className={classes.table}>
                <TableHead>
                    <TableRow>
                        <TableCell>Key</TableCell>
                        <TableCell align="right">Value</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {props.config.all().map(c => (
                        <TableRow key={c.key}>
                            <TableCell component="th" scope="row">
                                {c.key}
                            </TableCell>
                            <TableCell align="right">{c.value.toString()}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <br />
            <Button
                variant="contained"
                color="primary"
                onClick={onSave}>
                Save Config
            </Button>
        </PageContainer>
    );
};

export default withConfig(withStyles(containerStyles)(Settings));
