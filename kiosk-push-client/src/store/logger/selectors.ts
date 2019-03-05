import { createSelector } from "reselect";

import IState from "./../state";

const stateSelector = createSelector((state: IState) => state, s => s);
const logSelector = createSelector(stateSelector, s => s.logs);
const entries = createSelector(logSelector, l => l.entries);

export default createSelector(entries, e => e);
