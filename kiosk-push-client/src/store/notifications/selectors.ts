import { createSelector } from "reselect";

import rootSelector from "../selectors";

const notificationsSelector = createSelector(rootSelector, s => s.notifications);
const entries = createSelector(notificationsSelector, l => l.entries);

export const activeNotifications = createSelector(entries, e => e.filter(n => !n.dismissed));

export default createSelector(entries, e => e);
