import { Action } from "redux";
import { combineEpics, ofType } from "redux-observable";
import { Observable } from "rxjs";
import { delay, mapTo } from "rxjs/operators";

import { ConfigActionTypes, loadConfigSuccess } from "./actions";

export const loadConfigEpic =
    (action$: Observable<Action>) =>
        action$.pipe(
            ofType(ConfigActionTypes.Load),
            delay(3000),
            mapTo(loadConfigSuccess())
        );

export default combineEpics(loadConfigEpic);