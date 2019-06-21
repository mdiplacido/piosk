import { IPublisherService, PublisherCompletionEvent, PublisherCompletionStatus } from '../publisher.provider';
import { ConfigStore } from '../../config/config';

// tslint:disable:no-require-imports
// tslint:disable:no-var-requires
const Client = require("ssh2-sftp-client");

export class SftpPublisherService implements IPublisherService {
    readonly isEnabled: boolean;

    constructor(private readonly config: ConfigStore, private readonly password: string) {
        this.isEnabled = !!this.config.settings.enablePublishToSFTP;
    }

    public get currentPassword() {
        return this.password;
    }

    sendImage(image: Electron.NativeImage): Promise<PublisherCompletionEvent> {
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