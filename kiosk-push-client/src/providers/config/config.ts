export interface ConfigState {
    localPublishPath: string;
    sftpPublishPath: string;
    sftpUsername: string;
    sftpAddress: string;
    enablePublishToSFTP: boolean;
    enablePublishToDisk: boolean;
    minAvailableSpaceOnPiPercent: number;
    maxLogFileSizeBytes: number;
    maxLogLinesForDisplay: number;
    defaultPageSettleDelayMilliseconds: number;
}

export type UpdateConfigStateArg = Pick<ConfigState, keyof ConfigState> | ConfigState | null;

export interface ConfigStore {
    state: ConfigState;
    update: (newState: UpdateConfigStateArg) => void;
}
