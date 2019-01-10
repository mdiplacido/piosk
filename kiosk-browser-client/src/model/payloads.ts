
export enum KioskMessageType {
  Image = "Image", // the special image payload, see IImagePayload
  Stats = "Stats"  // kiosk stats eg. number of files etc.
}

export interface IKioskStatistics {
  fileCount: number;
}

export interface IImagePayload {
  path: string;
  author: string;
  data: string;  // eg base64 encoded image
}

export interface IKioskMessage {
  type: KioskMessageType;
  payload: IImagePayload | IKioskStatistics;
}
