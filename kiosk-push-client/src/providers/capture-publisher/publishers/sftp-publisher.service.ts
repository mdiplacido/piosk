import { IPublisherServiceProvider, PublisherCompletionEvent, PublisherCompletionStatus, IPublishInfo } from "../publisher.provider";
import { ConfigStore } from "../../config/config";

// tslint:disable:no-require-imports
// tslint:disable:no-var-requires
const Client = require("ssh2-sftp-client");

export class SftpPublisherService implements IPublisherServiceProvider {
    readonly isEnabled: boolean;

    constructor(private readonly config: ConfigStore, private readonly password: string) {
        this.isEnabled = !!this.config.settings.enablePublishToSFTP;
    }

    async canSend(): Promise<boolean> {
        // todo: check endpoint to see if there is space available
        throw new Error("Method not implemented.");
    }

    async sendImage(info: IPublishInfo): Promise<PublisherCompletionEvent> {
        const client = new Client();

        return new Promise<PublisherCompletionEvent>((resolve, reject) => {
            client
                .connect({
                    host: this.config.settings.sftpAddress,
                    port: "22",
                    username: this.config.settings.sftpUsername,
                    password: this.password
                })
                .then(() => {
                    return client.put(info.image.toPNG(), info.name);
                })
                .then(() => {
                    resolve({
                        status: PublisherCompletionStatus.Success,
                        message: "Image uploaded"
                    });
                })
                .catch((err: any) => {
                    reject({
                        status: PublisherCompletionStatus.Failure,
                        message: err
                    });
                });
        });
    }
}