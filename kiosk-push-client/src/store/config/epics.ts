import { Action } from "redux";
import { combineEpics, ofType } from "redux-observable";
import { Observable, of as observableOf } from "rxjs";
import { catchError, map, mergeMap, delay } from "rxjs/operators";

import { readJson } from "../../common/io/file-system";
import { ConfigState } from "../../providers/config/config";
import { ConfigActionTypes, loadConfigFailure, loadConfigSuccess } from "./actions";

export const loadConfigEpic =
    (action$: Observable<Action>) =>
        action$.pipe(
            ofType(ConfigActionTypes.Load),
            delay(3000),
            mergeMap(() => readJson("./config.json") as Observable<ConfigState>),
            map(config => loadConfigSuccess(config)),
            catchError(err => observableOf(loadConfigFailure(err))),
        );

export default combineEpics(loadConfigEpic);