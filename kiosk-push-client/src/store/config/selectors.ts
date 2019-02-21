import { createSelector } from "reselect";

import IState from "./../state";

const configSelector = (state: IState) => state.config;

// tslint:disable-next-line:max-line-length
export default createSelector(configSelector, c => c);
