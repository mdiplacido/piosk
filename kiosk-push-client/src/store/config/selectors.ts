import { createSelector } from "reselect";

import rootSelector from "../selectors";

const configSelector = createSelector(rootSelector, s => s.config);

const captureConfigSelector = createSelector(configSelector, c => c.captureConfigs);

export const captureConfigNamesSelector = createSelector(captureConfigSelector, cc => cc.map(item => item.name));

// tslint:disable-next-line:max-line-length
export default createSelector(configSelector, c => c);
