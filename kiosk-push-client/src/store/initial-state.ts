import IState, { ConfigStatus } from "./state";
import { ConfigState, ICaptureConfig } from "../providers/config/config";

const initialState: IState = {
    config: {
        captureConfigs: [
        ] as ICaptureConfig[],
    } as ConfigState,
    logs: {
        nextSequenceId: 1,
        entries: []
    },
    notifications: {
        nextSequenceId: 1,
        entries: []
    },
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