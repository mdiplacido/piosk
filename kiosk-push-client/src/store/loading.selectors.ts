import { createSelector } from "reselect";

import IState from "./state";

const loadStatus = (state: IState) => state.loadStatus;

export const loadStatusSelector = createSelector(loadStatus, s => s);
export const configStatusSelector = createSelector(loadStatusSelector, s => s.config);

export const configSavingSelector = createSelector(configStatusSelector, s => s.saving);
export const configSavedSelector = createSelector(configStatusSelector, s => s.saved);

export const isConfigLoadingSelector = createSelector(configStatusSelector, c => c.loading);
export const isConfigLoadedSelector = createSelector(configStatusSelector, c => c.loaded);

export const configFailedSelector = createSelector(configStatusSelector, s => s.failed);