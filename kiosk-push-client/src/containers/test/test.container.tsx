import { withStyles, Grid, Typography, Divider, Button, TextField } from "@material-ui/core";
import * as React from "react";
import { ChangeEvent } from "react";

import containerStyles, { ContainerStyleProps } from "../../components/common/styles";

// tslint:disable:no-require-imports
// tslint:disable:no-var-requires
const Client = require("ssh2-sftp-client");

export interface TestContainerProps extends ContainerStyleProps {
  image?: Electron.NativeImage;
}

export interface State {
  password: string;
  username: string;
}

class TestContainer extends React.Component<TestContainerProps, State> {
  constructor(props: TestContainerProps) {
    super(props);
    this.state = {
      password: "",
      username: ""
    };
  }

  render() {
    const { classes } = this.props;

    return (
      <div className={classes.root}>
        <Grid container spacing={16}>
          <Grid item xs={12}>
            <Typography className={classes.header} variant="h2" gutterBottom>
              Test
              </Typography>
            <Divider variant="middle" />
          </Grid>
          <Grid item xs={12} className={classes["content-row"]}>
            <TextField
              id="username"
              label="Username"
              className={classes.textField}
              value={this.state.username}
              onChange={this.onUsernameChange}
              margin="normal"
            />
            <br />
            <TextField
              id="password"
              label="Password"
              type="password"
              className={classes.textField}
              value={this.state.password}
              onChange={this.onPasswordChange}
              margin="normal"
            />
            <br />
            <Button disabled={!this.canUpload()} onClick={this.upload} variant="contained" color="primary" className={classes.button}>
              Test Upload Image
            </Button>
          </Grid>
        </Grid>
      </div>
    );
  }

  private canUpload = () => !!this.props.image && !!this.state.password.trim() && !! this.state.username.trim();

  private onUsernameChange = (event: ChangeEvent<HTMLInputElement>) => {
    this.setState({ username: event.target.value });
  }

  private onPasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    this.setState({ password: event.target.value });
  }

  private upload = () => {
    const image = this.props.image as Electron.NativeImage;
    const client = new Client();

    client
      .connect({
        host: "xxx.xxx.xxx.xxx",
        port: "22",
        username: this.state.username,
        password: this.state.password
      })
      .then(() => {
        return client.put(image.toPNG(), "from-client.png");
      })
      .then((success: any) => {
        console.log(`Got success ${success}`);
      })
      .catch((err: any) => {
        console.error(err, "catch error");
      });
  }
}

export default withStyles(containerStyles)(TestContainer);
