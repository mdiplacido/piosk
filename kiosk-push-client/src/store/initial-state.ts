import IState, { ConfigStatus } from "./state";
import { ConfigState } from "../providers/config/config";

const initialState: IState = {
    config: {} as ConfigState,
    logs: [],
    loadStatus: {
        config: {
            loading: false,
            loaded: false,
            failed: false,
            saving: false,
            saved: false,
            status: ConfigStatus.None
        }
    }
};

export default initialState;