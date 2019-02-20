import {
  Button,
  CircularProgress,
  createStyles,
  Snackbar,
  TextField,
  Theme,
  WithStyles,
  withStyles,
} from "@material-ui/core";
import { green } from "@material-ui/core/colors";
import classNames from "classnames";
import * as React from "react";
import { ChangeEvent } from "react";

import PageContainer from "../../components/common/page-container";
import containerStyles from "../../components/common/styles";
import {
  IPublisherService,
  IPublisherStore,
  PublisherProviderProps,
  withPublisher,
} from "../../providers/capture-publisher/publisher.provider";
import { ConfigProviderProps, withConfig } from "../../providers/config/config.provider";

export interface TestContainerProps extends WithStyles<typeof styles>, PublisherProviderProps, ConfigProviderProps {
  image?: Electron.NativeImage;
}

export interface State {
  password: string;
  username: string;
  saving: boolean;
  success: boolean;
  failed: boolean;
}

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
    },
    ...containerStyles(theme)
  }),
});

class TestContainer extends React.Component<TestContainerProps, State> {
  constructor(props: TestContainerProps) {
    super(props);
    this.state = {
      password: props.publisherStore.publisher.currentPassword,
      username: props.config.state.sftpUsername,
      saving: false,
      success: false,
      failed: false
    };
  }

  render() {
    const { classes, publisherStore: publisherStore } = this.props;
    const { success, failed, saving } = this.state;

    const buttonClassname = classNames({
      [classes.buttonSuccess]: success,
      [classes.button]: true
    });

    const onUpload = () => this.upload(publisherStore.publisher);

    const onPasswordChangeWithPub =
      (event: ChangeEvent<HTMLInputElement>) => this.onPasswordChange(event, publisherStore);

    return (
      <React.Fragment>
        <PageContainer title="Test">
          <TextField
            id="username"
            label="Username"
            className={classes.textField}
            value={this.state.username}
            disabled={true}
            margin="normal"
          />
          <br />
          <TextField
            id="password"
            label="Password"
            type="password"
            className={classes.textField}
            value={this.state.password}
            onChange={onPasswordChangeWithPub}
            margin="normal"
          />
          <br />
          <div className={classes.wrapperRoot}>
            <div className={classes.wrapper}>
              <Button
                variant="contained"
                color="primary"
                disabled={!this.canUpload() || saving}
                className={buttonClassname}
                onClick={onUpload}>
                Test Upload Image
              </Button>
              {saving && <CircularProgress size={24} className={classes.buttonProgress} />}
            </div>
          </div>
        </PageContainer>
        <Snackbar
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
          open={success || failed}
          autoHideDuration={6000}
          message={failed ? "Failed to upload image" : "Image uploaded"}
        />
      </React.Fragment>
    );
  }

  private canUpload = () => !!this.props.image && !!this.state.password.trim() && !!this.state.username.trim();

  private onPasswordChange = (event: ChangeEvent<HTMLInputElement>, publisherState: IPublisherStore) => {
    this.setState({ password: event.target.value }, () => {
      publisherState.changePassword(this.state.password);
    });
  }

  private upload = (publisher: IPublisherService) => {
    this.setState({ saving: true, success: false, failed: false }, () => {
      const image = this.props.image as Electron.NativeImage;
      publisher
        .sendImage(image)
        .then(result => {
          this.setResult(true);
          console.log(`${JSON.stringify(result)} + ${image.toPNG().length}`);
        })
        .catch(err => {
          this.setResult(false);
          console.error(err);
        });
    });
  }

  setResult = (success: boolean) => {
    this.setState({ success, failed: !success, saving: false });
  }
}

export default withConfig(withPublisher(withStyles(styles)(TestContainer)));
