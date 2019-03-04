import { Table, TableBody, TableCell, TableHead, TableRow, withStyles } from "@material-ui/core";
import * as React from "react";
import { connect } from "react-redux";

import PageContainer from "../../components/common/page-container";
import SpinnerButton from "../../components/common/spinner-button";
import containerStyles, { ContainerStyleProps } from "../../components/common/styles";
import { ConfigConsumerProps, withConfig } from "../../providers/config/config.provider";
import { configSavedSelector, configSavingSelector } from "../../store/loading.selectors";
import IState from "../../store/state";

export interface ConfigProviderSavingProps {
    saving: boolean;
    saved: boolean;
}

export interface SettingsProps extends ConfigConsumerProps, ConfigProviderSavingProps {
}

const Settings = (props: SettingsProps & ContainerStyleProps) => {
    const { classes, config, saving, saved } = props;

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
            <SpinnerButton onClickHandler={onSave} disabled={saving} spinning={saving} success={saved}>
                Save Config
            </SpinnerButton>
        </PageContainer>
    );
};

function withStateProps(state: IState): ConfigProviderSavingProps {
    return {
        saving: configSavingSelector(state),
        saved: configSavedSelector(state)
    };
}

export default connect(withStateProps)(withConfig(withStyles(containerStyles)(Settings)));
