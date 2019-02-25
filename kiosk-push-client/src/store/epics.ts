import { combineEpics } from "redux-observable";

import configEpics from "./config/epics";

export default combineEpics(
    configEpics,
);