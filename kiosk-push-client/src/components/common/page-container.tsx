import { Grid, withStyles } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import * as React from "react";

import containerStyles, { ContainerStyleProps } from "../../components/common/styles";

export interface PageContainerProps {
    title?: string;
    children?: React.ReactNode;
}

const PageContainer = (props: ContainerStyleProps & PageContainerProps) => {
    const { classes } = props;

    return (
        <div className={classes.root}>
            <Grid container spacing={16}>
                {props.title &&
                    <Grid xs={12} className={classes.headerGrid}>
                        <Typography className={classes.header} variant="h2" gutterBottom>
                            {props.title}
                        </Typography>
                    </Grid>
                }
                <Grid item xs={12} className={classes["content-row"]}>
                    {props.children}
                </Grid>
            </Grid>
        </div>
    );
};

export default withStyles(containerStyles)(PageContainer);
