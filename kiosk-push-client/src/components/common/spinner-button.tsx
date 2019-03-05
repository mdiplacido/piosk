import { Button, CircularProgress, withStyles } from "@material-ui/core";
import { green } from "@material-ui/core/colors";
import { createStyles, Theme, WithStyles } from "@material-ui/core/styles";
import classNames from "classnames";
import * as React from "react";

const styles = (theme: Theme) => ({
    ...createStyles({
        wrapperRoot: {
            display: "flex",
            alignItems: "center",
        },
        wrapper: {
            margin: theme.spacing.unit,
            "margin-left": "0px",
            position: "relative",
        },
        button: {
        },
        buttonSuccess: {
            backgroundColor: green[500],
            "&:hover": {
                backgroundColor: green[700],
            },
        },
        buttonProgress: {
            color: green[500],
            position: "absolute",
            top: "50%",
            left: "50%",
            marginTop: -12,
            marginLeft: -12,
        }
    }),
});

export type SpinnerButtonProps = {
    success: boolean;
    spinning: boolean;
    disabled: boolean;
    onClickHandler: React.MouseEventHandler<any>;
    children?: any;
} & WithStyles<typeof styles>;

class SpinnerButtonWrapper extends React.Component<SpinnerButtonProps, { success: boolean }> {
    constructor(props: SpinnerButtonProps) {
        super(props);
        this.state = {
            success: false
        };
    }

    componentDidUpdate(prevProps: SpinnerButtonProps) {
        if (!prevProps.success && this.props.success) {
            this.setState({ success: true });

            // TODO: ensure we are not unmounted...
            window.setTimeout(() => this.setState({ success: false }), 2000);
        }
    }

    render() {
        return (
            <SpinnerButton {...this.props} success={this.state.success} />
        );
    }
}

const SpinnerButton = (props: SpinnerButtonProps) => {
    const { classes, success, spinning: saving, disabled, onClickHandler } = props;

    const buttonClassname = classNames({
        [classes.buttonSuccess]: success,
        [classes.button]: true
    });

    return (
        <div className={classes.wrapperRoot}>
            <div className={classes.wrapper}>
                <Button
                    variant="contained"
                    disabled={disabled}
                    color="primary"
                    className={buttonClassname}
                    onClick={onClickHandler}>
                    {props.children}
                </Button>
                {saving && <CircularProgress size={24} className={classes.buttonProgress} />}
            </div>
        </div>);
};

export default withStyles(styles)(SpinnerButtonWrapper);