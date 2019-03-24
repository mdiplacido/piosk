import * as React from "react";
import AddIcon from "@material-ui/icons/Add";
import AppBar from "@material-ui/core/AppBar";
import Button from "@material-ui/core/Button";
import CloseIcon from "@material-ui/icons/Close";
import Dialog from "@material-ui/core/Dialog";
import IconButton from "@material-ui/core/IconButton";
import IState from "../../store/state";
import PageContainer from "../common/page-container";
import Slide from "@material-ui/core/Slide";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { captureConfigNamesSelector } from "../../store/config/selectors";
import { ChangeEvent } from "react";
import {
  ConfigConsumerProps,
  withConfig
  } from "../../providers/config/config.provider";
import { connect } from "react-redux";
import { containerStyles } from "../common/styles";
import {
  createStyles,
  Theme,
  WithStyles,
  withStyles
  } from "@material-ui/core/styles";
import {
  Fab,
  TextField,
  Tooltip
  } from "@material-ui/core";
import { ICaptureConfig } from "../../providers/config/config";
import { TransitionProps } from "@material-ui/core/transitions/transition";

const styles = (theme: Theme) => createStyles({
  appBar: {
    position: "relative",
  },
  flex: {
    flex: 1,
  },
  fab: {
    margin: theme.spacing.unit * 2,
  },
  absolute: {
    position: "absolute",
    bottom: theme.spacing.unit * 3,
    right: theme.spacing.unit * 3,
  },
  ...containerStyles(theme),
});

function Transition(props: TransitionProps) {
  return <Slide direction="up" {...props} />;
}

type ConfigConsumerWithCaptureNames = ConfigConsumerProps & { captureConfigNames: string[] };

type CaptureCreateDialogProps = WithStyles<typeof styles> & ConfigConsumerWithCaptureNames;

type CaptureCreateDialogState = {
  open: boolean, canSave: boolean
} & {
  config: ICaptureConfig
};

class CaptureCreateDialog extends React.Component<CaptureCreateDialogProps, CaptureCreateDialogState> {
  constructor(props: any) {
    super(props);
    this.state = {
      open: false,
      canSave: false,
      config: {
        name: "",
        url: "http://",
        author: "",
        description: "",
        captureIntervalSeconds: 60,
      }
    };
  }

  handleClickOpen = () => {
    this.setState({ open: true });
  }

  handleClose = () => {
    this.setState({ open: false });
  }

  save = () => {
    this.props.config.saveCaptureConfig(this.state.config);
  }

  setField = (name: string, minimum?: number) => (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const type = event.target.type;
    this.setState(prev => ({
      ...prev,
      config: {
        ...prev.config,
        [name]: type !== "number" ?
          value :
          minimum != null && +value < minimum ?
            prev.config[name] :
            value
      }
    }), () => {
      const { name, description, url, author } = this.state.config;
      const nameTaken = this.props.captureConfigNames
        .some(n => n.toLowerCase() === name.toLowerCase());

      this.setState({
        canSave: !!name.trim().length
          && !!description.trim().length
          && !!url.trim().length
          && !!author.trim().length
          && !nameTaken
      });
    });
  }

  render() {
    const { classes } = this.props;

    return (
      <div>
        <Tooltip title="Add" aria-label="Add" onClick={this.handleClickOpen}>
          <Fab color="secondary" className={classes.absolute}>
            <AddIcon />
          </Fab>
        </Tooltip>
        <Dialog
          fullScreen
          open={this.state.open}
          onClose={this.handleClose}
          TransitionComponent={Transition}
        >
          <AppBar className={classes.appBar}>
            <Toolbar>
              <IconButton color="inherit" onClick={this.handleClose} aria-label="Close">
                <CloseIcon />
              </IconButton>
              <Typography variant="h6" color="inherit" className={classes.flex}>
                Create Capture Config
              </Typography>
              <Button color="inherit" onClick={this.save} disabled={!this.state.canSave}>
                save
              </Button>
            </Toolbar>
          </AppBar>
          <PageContainer>
            <TextField
              required
              id="name"
              label="Name"
              className={classes.textField}
              value={this.state.config.name}
              onChange={this.setField("name")}
              margin="normal"
            />
            <br />
            <TextField
              required
              id="author"
              label="Author"
              className={classes.textField}
              value={this.state.config.author}
              onChange={this.setField("author")}
              margin="normal"
            />
            <br />
            <TextField
              required
              id="description"
              label="Description"
              className={classes.textField}
              value={this.state.config.description}
              onChange={this.setField("description")}
              margin="normal"
            />
            <br />
            <TextField
              required
              id="url"
              label="Url"
              className={classes.textField}
              value={this.state.config.url}
              onChange={this.setField("url")}
              margin="normal"
            />
            <br />
            <TextField
              id="captureIntervalSeconds"
              label="Interval (seconds)"
              value={this.state.config.captureIntervalSeconds}
              onChange={this.setField("captureIntervalSeconds", 60 /* minimum */)}
              type="number"
              className={classes.textField}
              InputLabelProps={{
                shrink: true,
              }}
              margin="normal"
            />
          </PageContainer>
        </Dialog>
      </div>
    );
  }
}

function mapStateToProps(state: IState) {
  return {
    captureConfigNames: captureConfigNamesSelector(state),
  };
}

export default connect(mapStateToProps)(withStyles(styles)(withConfig(CaptureCreateDialog)));
