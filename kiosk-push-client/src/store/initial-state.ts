import { IState } from "./state";
import { ConfigState } from "../providers/config/config";

const initialState: IState = {
    config: {} as ConfigState,
    loadStatus: {
        config: {
            loading: false,
            loaded: false,
            failed: false
        }
    }
};

export default initialState;