export interface Config {
    readonly pickupDirectory: string;
    readonly port: number;
    readonly isReaperEnabled: boolean;
    readonly reapIntervalSeconds: number;
    readonly pickupQuotaMb: number;
    readonly maxLogSizeBytes: number;
    readonly maxLogFiles: number;
}
