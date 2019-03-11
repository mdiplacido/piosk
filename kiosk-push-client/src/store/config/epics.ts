import { Action } from "redux";
import { combineEpics, ofType } from "redux-observable";
import { Observable, of as observableOf } from "rxjs";
import { catchError, delay, map, mapTo, mergeMap, withLatestFrom } from "rxjs/operators";

import { readJson, saveJson } from "../../common/io/file-system";
import { ConfigState } from "../../providers/config/config";
import { IEpicDependencies } from "../epic-dependencies";
import { LoggerSeverity, nextLogMessage } from "../logger/actions";
import { nextNotification } from "../notifications/actions";
import IState from "../state";
import {
    ConfigActionTypes,
    ISaveConfigAction,
    loadConfigFailure,
    loadConfigSuccess,
    saveConfigFailure,
    saveConfigSuccess,
} from "./actions";

export const loadConfigEpic$ =
    (action$: Observable<Action>, _state$: Observable<IState>, dependencies: IEpicDependencies) =>
        action$.pipe(
            ofType(ConfigActionTypes.Load),
            delay(dependencies.testDelayMilliseconds),
            mergeMap(() => readJson("./config.json") as Observable<ConfigState>),
            map(config => loadConfigSuccess(config)),
            catchError(err => observableOf(
                loadConfigFailure(err),
                nextLogMessage(JSON.stringify(err), LoggerSeverity.Error),
                nextNotification("Failed to load config, see error log", LoggerSeverity.Error)
            )),
        );

export const saveConfigEpic$ =
    (action$: Observable<ISaveConfigAction>, state$: Observable<IState>, dependencies: IEpicDependencies) =>
        action$.pipe(
            ofType(ConfigActionTypes.Save),
            delay(dependencies.testDelayMilliseconds),
            withLatestFrom(state$),
            mergeMap(([action, state]) =>
                saveJson("./config.json", { ...state.config, ...action.config })
                    .pipe(
                        mapTo({ ...state.config, ...action.config }),
                    )
            ),
            mergeMap((config: ConfigState) => [
                saveConfigSuccess(config),
                nextNotification("Configuration save complete", LoggerSeverity.Info)
            ]),
            catchError(err => observableOf(
                saveConfigFailure(err),
                nextLogMessage(JSON.stringify(err), LoggerSeverity.Error),
                nextNotification("Failed to save config, see error log", LoggerSeverity.Error)
            ))
        );

export default combineEpics(loadConfigEpic$, saveConfigEpic$);