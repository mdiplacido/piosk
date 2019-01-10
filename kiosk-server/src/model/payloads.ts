
enum KioskMessageType {
    Image = "Image", // the special image payload, see IImagePayload
    Stats = "Stats"  // kiosk stats eg. number of files etc.
}

interface IKioskStatistics {
    fileCount: number;
}

interface IImagePayload {
    path: string;
    author: string;
    data: string;  // eg base64 encoded image
}

interface IKioskMessage {
    type: KioskMessageType;
    payload: IImagePayload | IKioskStatistics;
}
