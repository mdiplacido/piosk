import {
    Button,
    Card,
    CardActionArea,
    CardActions,
    CardContent,
    Typography,
    WithStyles,
    withStyles,
} from "@material-ui/core";
import * as React from "react";
import * as moment from "moment";

import { ICaptureConfig } from "../../providers/config/config";
import Clock, { getClockParamsFromConfig } from "../countdown/clock";

export interface CaptureCardProps extends WithStyles<typeof styles> {
    captureConfig: ICaptureConfig;
}

const styles = {
    card: {
        maxWidth: 345,
    },
    media: {
        height: 140,
    },
};

const CaptureCard = (props: CaptureCardProps) => {
    const { classes, captureConfig: capture } = props;

    return (
        <Card className={classes.card}>
            <CardActionArea>
                <CardContent>
                    <Typography gutterBottom variant="h5" component="h2">
                        {capture.name}
                    </Typography>
                    <Typography component="p">
                        {capture.description}
                    </Typography>
                    <Typography component="p">
                        {capture.url}
                    </Typography>
                    <br />
                    <Typography component="p">
                        Last capture {moment(capture.lastCapture).format("MMMM Do YYYY, h:mm:ss a") || "n/a"}
                    </Typography>
                    <Typography component="p">
                        Next capture: <Clock {...getClockParamsFromConfig(capture)} />
                    </Typography>
                </CardContent>
            </CardActionArea>
            <CardActions>
                <Button size="small" color="primary">
                    Pause
                </Button>
                <Button size="small" color="primary">
                    Capture
                </Button>
                <Button size="small" color="primary">
                    Delete
                </Button>
            </CardActions>
        </Card>
    );
};

export default withStyles(styles)(CaptureCard);
