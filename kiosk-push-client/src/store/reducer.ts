import { combineReducers } from "redux";

import configReducer from "./config/reducer";
import loggerReducer from "./logger/reducer";
import loadingReducer from "./loading.reducer";
import IState from "./state";

const rootReducer = combineReducers<IState>({
    config: configReducer,
    logs: loggerReducer,
    loadStatus: loadingReducer
});

export default rootReducer;