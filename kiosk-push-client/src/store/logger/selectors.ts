import { createSelector } from "reselect";

import rootSelector from "../selectors";

const logSelector = createSelector(rootSelector, s => s.logs);
const entries = createSelector(logSelector, l => l.entries);

export default createSelector(entries, e => e);
