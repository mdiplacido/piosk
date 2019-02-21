import { createSelector } from "reselect";

import IState from "./state";

const loadStatus = (state: IState) => state.loadStatus;

export const loadStatusSelector = createSelector(loadStatus, s => s);

export const configLoadingSelector = createSelector(loadStatusSelector, s => s.config);

export const isConfigLoadingSelector = createSelector(configLoadingSelector, c => c.loading);
