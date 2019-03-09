import { combineReducers } from "redux";

import configReducer from "./config/reducer";
import loadingReducer from "./loading.reducer";
import loggerReducer from "./logger/reducer";
import notificationsReducer from "./notifications/reducer";
import IState from "./state";

const rootReducer = combineReducers<IState>({
    config: configReducer,
    logs: loggerReducer,
    loadStatus: loadingReducer,
    notifications: notificationsReducer,
});

export default rootReducer;