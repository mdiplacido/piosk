import * as React from "react";
import { Route, Switch } from "react-router-dom";

import ControllerContainer from "./containers/controller/controller.container";
import Logs from "./containers/logs/logs.container";
import Settings from "./containers/settings/settings.container";
import TestContainer from "./containers/test/test.container";

const AppRoutes = () => {
    return (
        <Switch>
            <Route path="/logs" component={Logs} />
            <Route path="/settings" component={Settings} />
            {/* passing empty to satisfy the compiler :( */}
            <Route path="/test" component={TestContainer} />
            <Route component={ControllerContainer} />
        </Switch>
    );
};

export default AppRoutes;
