
export enum KioskMessageType {
    Image = "Image", // the special image payload, see IImagePayload
    Stats = "Stats"  // kiosk stats eg. number of files etc.
}

export interface IKioskStatistics {
    fileCount: number;
}

export interface IImagePayload {
    author: string;
    birthtimeMs: number;
    data: string;  // eg base64 encoded image
    name: string;  // think of this as the "channel" name    
    path: string;
    url?: string;
}

export interface IKioskMessage {
    type: KioskMessageType;
    payload: IImagePayload | IKioskStatistics;
}
