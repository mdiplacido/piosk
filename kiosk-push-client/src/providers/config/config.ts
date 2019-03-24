export enum CaptureStatus {
    None = "none",
    PickedUp = "pickedUp",
    Loading = "loading",
    Settling = "settling",
    Capturing = "capturing",
    Completed = "completed",
    Failed = "failed",
    Paused = "paused",
}

export const PickupStates = [
    CaptureStatus.None,
    CaptureStatus.Completed,
    CaptureStatus.Failed
];

export interface ICaptureConfig {
    name: string;
    url: string;
    author: string;
    description: string;
    captureIntervalSeconds: number;
    lastCapture?: Date;
    additionalData?: {
        status: CaptureStatus;
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

export interface ConfigStore {
    settings: ConfigState;
    captureConfigs: () => ICaptureConfig[];
    update: (newState: ConfigState | Partial<ConfigState>, silent?: boolean) => void;
    saveCaptureConfig: (config: ICaptureConfig) => void;
    all: (includeCapture: boolean) => Array<{ key: string, value: any }>;
}
