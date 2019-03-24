import { Table, TableBody, TableCell, TableHead, TableRow, withStyles } from "@material-ui/core";
import * as React from "react";
import { useState } from "react";
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

    const [currentConfigState, setCurrentConfigState] = useState(config.settings);

    const onSave = () => {
        config.update(currentConfigState);
    };

    const updateConfigState = (key: string, value: string) => {
        const lowerValue = value.toLowerCase();
        const coercedValue = lowerValue === "true" ?
            true :
            lowerValue === "false" ?
                false :
                isNaN(+lowerValue) ?
                    value :
                    +lowerValue;

        const nextConfigState = { ...currentConfigState, [key]: coercedValue };
        setCurrentConfigState(nextConfigState);
    };

    return (
        <PageContainer title="Settings">
            <Table className={classes.table}>
                <TableHead>
                    <TableRow>
                        <TableCell>Key</TableCell>
                        <TableCell align="left">Value</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {props.config    // we drive with the store config keys
                        .all(false)  // do not include capture config
                        .map(c => (
                            <TableRow key={c.key}>
                                <TableCell component="th" scope="row">
                                    {c.key}
                                </TableCell>
                                <TableCell align="left">
                                    <input
                                        size={100}
                                        type="text"
                                        name={c.key}
                                        defaultValue={currentConfigState[c.key]}   // we use the current component state
                                        onChange={e => updateConfigState(c.key, e.target.value)} />
                                </TableCell>
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
