import * as React from "react";
import containerStyles from "../../components/common/styles";
import PageContainer from "../../components/common/page-container";
import SpinnerButton from "../../components/common/spinner-button";
import { ChangeEvent } from "react";
import {
  ConfigConsumerProps,
  withConfig
  } from "../../providers/config/config.provider";
import { connect } from "react-redux";
import {
  createStyles,
  TextField,
  Theme,
  WithStyles,
  withStyles
  } from "@material-ui/core";
import { green } from "@material-ui/core/colors";
import {
  INotificationsActionsProp,
  mapNotificationActionsToProps
  } from "../../store/notifications/actions";
import { LoggerSeverity } from "../../store/logger/actions";

import {
  IPublisherService,
  IPublisherStore,
  makePublishInfo,
  PublisherProviderProps,
  withPublisher,
} from "../../providers/capture-publisher/publisher.provider";

export interface State {
  password: string;
  username: string;
  saving: boolean;
  success: boolean;
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

export interface TestContainerImageProp {
  image?: Electron.NativeImage;
}

export interface TestContainerProps extends WithStyles<typeof styles>, PublisherProviderProps, ConfigConsumerProps, TestContainerImageProp {
}
class TestContainer extends React.Component<TestContainerProps & INotificationsActionsProp, State> {
  mounted = false;

  constructor(props: TestContainerProps & INotificationsActionsProp) {
    super(props);
    this.state = {
      password: props.publisherStore.currentPassword,
      username: props.config.settings.sftpUsername,
      saving: false,
      success: false
    };
  }

  componentDidMount(): void {
    this.mounted = true;
  }

  componentWillUnmount(): void {
    this.mounted = false;
  }

  render() {
    const { classes, publisherStore: publisherStore } = this.props;
    const { success, saving } = this.state;

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
          <SpinnerButton
            onClickHandler={onUpload}
            spinning={saving}
            success={success}
            disabled={!this.canUpload() || saving}>
            Test Upload Image
          </SpinnerButton>
        </PageContainer>
      </React.Fragment>
    );
  }

  private canUpload = () => !!this.props.image && !!this.state.password.trim() && !!this.state.username.trim();

  private onPasswordChange = (event: ChangeEvent<HTMLInputElement>, publisherState: IPublisherStore) => {
    this.setState({ password: event.target.value }, () => {
      publisherState.changePassword(this.state.password);
    });
  }

  private upload = (publishProvider: IPublisherService) => {
    this.setState({ saving: true, success: false }, () => {
      const image = this.props.image as Electron.NativeImage;
      const publishInfo = makePublishInfo(image);

      // here is an example of a memory leak. if we fire this and then the user moves to a different
      // view the call back would still happen but the current component is now unmounted.
      // todo: convert this to react hooks pattern... where we cancel.  option REDUX with side-effects
      // and cancellation would work too.
      publishProvider
        .sendImage(publishInfo)
        .then(result => {
          this.setResult(true);
          console.log(`${JSON.stringify(result)} + ${image.toPNG().length}`);
        })
        .catch((err: any) => {
          this.props.notificationActions.next(
            JSON.stringify(err),
            LoggerSeverity.Error,
          );

          this.setResult(false);
          console.error(err);
        });
    });
  }

  setResult = (success: boolean) => {
    if (this.mounted) {
      this.setState({ success, saving: false });
    }
  }
}

export default connect(null, mapNotificationActionsToProps)(withConfig<TestContainerImageProp>(withPublisher(withStyles(styles)(TestContainer))));
