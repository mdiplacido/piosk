import { IState } from "./state";
import { combineReducers } from "redux";
import configReducer from "./config/reducer";
import loadingReducer from "./loading.reducer";

const rootReducer = combineReducers<IState>({
    config: configReducer,
    loadStatus: loadingReducer
});

export default rootReducer;