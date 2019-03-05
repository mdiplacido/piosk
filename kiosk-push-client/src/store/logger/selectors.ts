import { createSelector } from "reselect";

import IState from "./../state";

const logSelector = createSelector((state: IState) => state.logs, l => l);

export default createSelector(logSelector, l => l.entries);
