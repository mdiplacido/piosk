import { IPublisherService, PublisherCompletionEvent, PublisherCompletionStatus } from '../publisher.provider';
import { ConfigStore } from '../../config/config';
import * as fs from "fs";

export class FilePublisherService implements IPublisherService {
    readonly isEnabled: boolean;
    currentPassword: string;

    constructor(private readonly config: ConfigStore) {
        this.isEnabled = !!this.config.settings.enablePublishToDisk;
    }

    sendImage(image: Electron.NativeImage): Promise<PublisherCompletionEvent> {
        return new Promise<PublisherCompletionEvent>((resolve, reject) => {
            const filePath = this.config.settings.localPublishPath + "/" + "client-test-image.png";
            fs.writeFile(filePath, image.toPNG(), err => {
                if (!err) {
                    resolve({
                        status: PublisherCompletionStatus.Success,
                        message: "Image written to disk"
                    });
                } else {
                    reject({
                        status: PublisherCompletionStatus.Failure,
                        message: err
                    });
                }
            });
        });
    }
}