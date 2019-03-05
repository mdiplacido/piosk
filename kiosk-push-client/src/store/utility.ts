import { Dispatch } from "redux";

export interface ActionMapper<P> {
    (dispatch: Dispatch): P;
}

export const combineActionPropMappers =
    <P>(...mappers: ActionMapper<Partial<P>>[]) =>
        (dispatch: Dispatch) =>
            mappers.reduce((acc, curr) => ({ ...acc, ...curr(dispatch) }), {} as P);