import { ConfigStore } from "../config/config";
import { IPublisherService, PublisherCompletionEvent, PublisherCompletionStatus, IPublishInfo } from "./publisher.provider";
import { SftpPublisherService } from './publishers/sftp-publisher.service';
import { FilePublisherService } from './publishers/file-publisher.service';

export class PublisherService implements IPublisherService {
    private readonly publishers: IPublisherService[];
    
    public isEnabled = true;

    constructor(config: ConfigStore, private readonly password: string) {
        this.publishers = [
            new SftpPublisherService(config, password),
            new FilePublisherService(config),
        ];
    }

    public get currentPassword() {
        return this.password;
    }

    async sendImage(info: IPublishInfo): Promise<PublisherCompletionEvent> {
        const promises = this.publishers
            .filter(p => p.isEnabled)
            .map(p => p.sendImage(info));
            
        const results = await Promise.all(promises);

        // find any that is success, if not just take the first one
        const success = results.find(r => r.status === PublisherCompletionStatus.Success);

        return success || 
            results.find(r => r.status !== PublisherCompletionStatus.Success) || 
            {
                message: "uknown issue sending image",
                status: PublisherCompletionStatus.None,
            };
    }
}