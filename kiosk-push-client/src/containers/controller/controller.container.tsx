import { Divider, Grid, Typography, withStyles, Button, TextField } from "@material-ui/core";
import * as React from "react";
import { ChangeEvent } from "react";

import { Controller } from "../../App";
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
        <div className={classes.root}>
            <Grid container spacing={16}>
                <Grid item xs={12}>
                    <Typography className={classes.header} variant="h2" gutterBottom>
                        Controller
                    </Typography>
                    <Divider variant="middle" />
                </Grid>
                <Grid item xs={12} className={classes["content-row"]}>
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
                </Grid>
            </Grid>
        </div>
    );
};

export default withStyles(containerStyles)(ControllerContainer);
