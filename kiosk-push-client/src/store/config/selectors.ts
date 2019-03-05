import { createSelector } from "reselect";

import rootSelector from "../selectors";

const configSelector = createSelector(rootSelector, s => s.config);

// tslint:disable-next-line:max-line-length
export default createSelector(configSelector, c => c);
