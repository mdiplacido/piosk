import { applyMiddleware, createStore } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import immutableStateInvariantMiddleware from "redux-immutable-state-invariant";

import initialStoreState from "./initial-state";
import rootReducer from "./reducer";
import { IState } from "./state";

// TODO: are folks conditionally adding the immutableStateInvariantMiddleware for
// prod vs. dev builds? -marcodi
export default function configureStore(initialState: IState = initialStoreState) {
    return createStore(
        rootReducer,
        initialState,
        composeWithDevTools(applyMiddleware(immutableStateInvariantMiddleware()))
    );
}
