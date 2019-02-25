import { applyMiddleware, createStore } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import immutableStateInvariantMiddleware from "redux-immutable-state-invariant";
import { createEpicMiddleware } from "redux-observable";

import rootEpic from "./epics";
import initialStoreState from "./initial-state";
import rootReducer from "./reducer";
import IState from "./state";

const epicMiddleware = createEpicMiddleware();

// TODO: are folks conditionally adding the immutableStateInvariantMiddleware for
// prod vs. dev builds? -marcodi
export default function configureStore(initialState: IState = initialStoreState) {
    const store = createStore(
        rootReducer,
        initialState,
        composeWithDevTools(applyMiddleware(epicMiddleware, immutableStateInvariantMiddleware()))
    );

    epicMiddleware.run(rootEpic);

    return store;
}
