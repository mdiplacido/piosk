export interface ICaptureConfig {
    name: string;
    url: string;
    author: string;
    description: string;
    captureIntervalSeconds: number;
    lastCapture?: Date;
    additionalData?: {
        processing: boolean;
    };
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
    captureConfigs: () => ICaptureConfig[];
    update: (newState: UpdateConfigStateArg) => void;
    all: (includeCapture: boolean) => Array<{ key: string, value: any }>;
}
