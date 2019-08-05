import { ConfigStore } from "../config/config";
import { FilePublisherService } from "./publishers/file-publisher.service";
import { SftpPublisherService } from "./publishers/sftp-publisher.service";
import {
    IPublisherService,
    IPublisherServiceProvider,
    IPublishInfo,
    PublisherCompletionEvent,
    PublisherCompletionStatus,
    PublisherQueue,
} from "./publisher.provider";

type PartialPublisherProvider = Pick<IPublisherServiceProvider, "isEnabled">;

const MAX_QUEUE_SIZE = 2;

// TODO: need a timer somewhere that calls the PublisherService to push the next image
export class PublisherService implements IPublisherService, PartialPublisherProvider {
    private readonly publishers: IPublisherServiceProvider[];
    public isEnabled = true;

    constructor(
        config: ConfigStore,
        password: string,
        private readonly queue: PublisherQueue) {
        this.publishers = [
            new SftpPublisherService(config, password),
            new FilePublisherService(config),
        ];
    }

    canEnqueue(): boolean {
        return this.queue.size() < MAX_QUEUE_SIZE;
    }

    async enqueue(info: IPublishInfo): Promise<void> {
        // TODO: write to disk
        // TODO: just add file path to queue of items to process.
        // this will allow us to read the queue from disk after a crash
        // and pickup where we left off, for now this will just be done
        // in memory
        if (this.queue.size() >= MAX_QUEUE_SIZE) {
            throw new Error(`unexpected state! publish queue has exceeded size ${MAX_QUEUE_SIZE}`);
        }

        this.queue.enqueue({ attempts: 0, info });
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
                message: "unknown issue sending image",
                status: PublisherCompletionStatus.None,
            };
    }
}