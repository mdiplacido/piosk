import { ConfigStore } from "../config/config";
import { IPublisherService, PublisherCompletionEvent, PublisherCompletionStatus } from "./publisher.provider";

// tslint:disable:no-require-imports
// tslint:disable:no-var-requires
const Client = require("ssh2-sftp-client");

export class PublisherService implements IPublisherService {
    constructor(private readonly config: ConfigStore, private readonly password: string) {
    }

    public get currentPassword() {
        return this.password;
    }

    sendImage(image: Electron.NativeImage): Promise<PublisherCompletionEvent> {
        const client = new Client();

        return new Promise<PublisherCompletionEvent>((resolve, reject) => {
            client
                .connect({
                    host: this.config.state.sftpAddress,
                    port: "22",
                    username: this.config.state.sftpUsername,
                    password: this.password
                })
                .then(() => {
                    return client.put(image.toPNG(), "client-test-image.png");
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