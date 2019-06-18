import { applyMiddleware, createStore } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import immutableStateInvariantMiddleware from "redux-immutable-state-invariant";
import { createEpicMiddleware } from "redux-observable";

import { IEpicDependencies } from "./epic-dependencies";
import rootEpic from "./epics";
import initialStoreState from "./initial-state";
import rootReducer from "./reducer";
import IState from "./state";
import { createLoggingMiddleware } from './middleware/logging/file-logger';

const epicDependencies: IEpicDependencies = {
    testDelayMilliseconds: 0
};

const epicMiddleware = createEpicMiddleware({ dependencies: epicDependencies });

// TODO: are folks conditionally adding the immutableStateInvariantMiddleware for
// prod vs. dev builds? -marco
export default function configureStore(initialState: IState = initialStoreState) {
    const loggingMiddleware = createLoggingMiddleware();

    const store = createStore(
        rootReducer,
        initialState,
        composeWithDevTools(applyMiddleware(epicMiddleware, loggingMiddleware, immutableStateInvariantMiddleware()))
    );

    epicMiddleware.run(rootEpic);

    return store;
}
