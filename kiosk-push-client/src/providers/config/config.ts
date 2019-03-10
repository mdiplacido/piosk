export interface ICaptureConfig {
    name: string;
    url: string;
    author: string;
    captureIntervalSeconds: number;
    lastCapture: Date;
}

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
    captureConfigs: ICaptureConfig[];
}

export type UpdateConfigStateArg = Partial<ConfigState> | ConfigState | null;

export interface ConfigStore {
    settings: ConfigState;
    update: (newState: UpdateConfigStateArg) => void;
    all: (includeCapture: boolean) => Array<{key: string, value: any}>;
}
