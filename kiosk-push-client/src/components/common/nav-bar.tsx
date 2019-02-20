import AppBar from "@material-ui/core/AppBar";
import { withStyles } from "@material-ui/core/styles";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import * as React from "react";
import { Button } from "@material-ui/core";
import { withRouter, RouteComponentProps } from "react-router-dom";

const styles = {
    grow: {
        flexGrow: 1,
    }
};

export interface NavBarProps extends RouteComponentProps {
    classes: { [key: string]: any };
}

const NavBar = (props: NavBarProps) => {
    const { classes } = props;
    const { history } = props;

    const navigateTo = (path: string) => () => { history.push(path); };

    return (
        <div>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h5" color="inherit" className={classes.grow}>
                        Piosk Push Client
                    </Typography>
                    <Button color="inherit" onClick={navigateTo("/")}>Controller</Button>
                    <Button color="inherit" onClick={navigateTo("/settings")}>Settings</Button>
                    <Button color="inherit" onClick={navigateTo("/test")}>Test</Button>
                    <Button color="inherit" onClick={navigateTo("/logs")}>Logs</Button>
                </Toolbar>
            </AppBar>
        </div>
    );
};

export default withStyles(styles)(withRouter(NavBar));
