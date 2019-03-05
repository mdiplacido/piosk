import IState from "./state";
import { createSelector } from "reselect";

// the default root selector
const stateSelector = createSelector((state: IState) => state, s => s);

export default stateSelector;