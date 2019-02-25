import { combineReducers } from "redux";

import configReducer from "./config/reducer";
import loadingReducer from "./loading.reducer";
import IState from "./state";

const rootReducer = combineReducers<IState>({
    config: configReducer,
    loadStatus: loadingReducer
});

export default rootReducer;