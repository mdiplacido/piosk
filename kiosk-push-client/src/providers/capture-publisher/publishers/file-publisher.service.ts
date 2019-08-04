import { IPublisherServiceProvider, PublisherCompletionEvent, PublisherCompletionStatus, IPublishInfo } from "../publisher.provider";
import { ConfigStore } from "../../config/config";

import * as fs from "fs";

export class FilePublisherService implements IPublisherServiceProvider {
    readonly isEnabled: boolean;
    currentPassword: string;

    constructor(private readonly config: ConfigStore) {
        this.isEnabled = !!this.config.settings.enablePublishToDisk;
    }

    async canSend(): Promise<boolean> {
        // dumb for now, just assume there is disk
        // space available.
        return true;
    }

    async sendImage(info: IPublishInfo): Promise<PublisherCompletionEvent> {
        return new Promise<PublisherCompletionEvent>((resolve, reject) => {
            const filePath = this.config.settings.localPublishPath + "/" + info.name;
            fs.writeFile(filePath, info.image.toPNG(), err => {
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