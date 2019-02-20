import { Button, TextField, Typography, withStyles } from "@material-ui/core";
import * as React from "react";
import { ChangeEvent } from "react";

import { Controller } from "../../App";
import PageContainer from "../../components/common/page-container";
import containerStyles, { ContainerStyleProps } from "../../components/common/styles";

export interface ControllerContainerProps extends ContainerStyleProps {
    url: string;
    controller: Controller;
}

const ControllerContainer = (props: ControllerContainerProps) => {
    const { controller, url, classes } = props;

    const handleOnUrlChange = (event: ChangeEvent<HTMLInputElement>) => {
        controller.urlChange(event.target.value);
    };

    return (
        <PageContainer title="Controller">
            <Typography variant="subtitle2" gutterBottom>
                current url: {url}
            </Typography>
            <br />
            <Button onClick={controller.screenshot} variant="contained" className={classes.button}>
                Screenshot
            </Button>
            <br />
            <br />
            <Button onClick={controller.openWindow} variant="contained" className={classes.button}>
                Open new window
            </Button>
            <br />
            <br />
            <Button onClick={controller.loadUrl} variant="contained" className={classes.button}>
                Refresh
            </Button>
            <br />
            <br />
            <Button onClick={controller.maximize} variant="contained" className={classes.button}>
                Maximize
            </Button>
            <br />
            <br />
            <TextField
                id="url"
                label="Change current Url"
                className={classes.textField}
                value={url}
                onChange={handleOnUrlChange}
                margin="normal"
                fullWidth={true}
            />
        </PageContainer>
    );
};

export default withStyles(containerStyles)(ControllerContainer);
