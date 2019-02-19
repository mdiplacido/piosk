import * as React from "react";
import { Route, Switch } from "react-router-dom";

import { Controller } from "./App";
import ControllerContainer from "./containers/controller/controller.container";
import TestContainer from "./containers/test/test.container";

const AppRoutes = (props: { controller: Controller, image?: Electron.NativeImage, url: string }) => {
    return (
        <Switch>
            <Route path="/test" render={() => <TestContainer image={props.image} />} />
            <Route render={() => <ControllerContainer url={props.url} controller={props.controller}></ControllerContainer>} />
        </Switch>
    );
};

export default AppRoutes;
