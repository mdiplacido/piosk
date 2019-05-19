export enum CaptureStatus {
    None = "none",
    PickedUp = "pickedUp",
    Loading = "loading",
    Loaded = "loaded",
    Settling = "settling",
    Settled = "settled",
    Capturing = "capturing",
    Captured = "captured",
    // Don't see a need for completed state yet... captured seems to be enough
    // Completed = "completed",
    Canceled = "canceled",
    Failed = "failed",
    Paused = "paused",
}

export const PickupStates = [
    CaptureStatus.None,
    CaptureStatus.Captured,
    CaptureStatus.Failed,
    CaptureStatus.Canceled
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
    defaultPageSettleDelaySeconds: number;
    captureCheckIntervalSeconds: number;
    captureConfigs: ICaptureConfig[];
}

export interface ConfigStore {
    settings: ConfigState;
    captureConfigs: () => ICaptureConfig[];
    update: (newState: ConfigState | Partial<ConfigState>, silent?: boolean) => void;
    saveCaptureConfig: (config: ICaptureConfig, silent?: boolean) => void;
    saveCaptureStatus: (captureName: string, captureStatus: CaptureStatus) => void;
    all: (includeCapture: boolean) => Array<{ key: string, value: any }>;
}
