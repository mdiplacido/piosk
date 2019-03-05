import * as React from "react";
import { Route, Switch } from "react-router-dom";
import { Controller } from "./App";
import ControllerContainer from "./containers/controller/controller.container";
import Logs from "./containers/logs/logs.container";
import Settings from "./containers/settings/settings.container";
import TestContainer, { TestContainerProps } from "./containers/test/test.container";

const AppRoutes = (props: { controller: Controller, image?: Electron.NativeImage, url: string }) => {
    return (
        <Switch>
            <Route path="/logs" component={Logs} />
            <Route path="/settings" component={Settings} />
            {/* passing empty to satisfy the compiler :( */}
            <Route path="/test" render={() => <TestContainer image={props.image} {...{} as TestContainerProps} /> } />
            <Route render={() => <ControllerContainer url={props.url} controller={props.controller}></ControllerContainer>} />
        </Switch>
    );
};

export default AppRoutes;
