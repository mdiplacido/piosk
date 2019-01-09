import { Logger } from '../logging/logger';

export class PickupReaper {
    private readonly logger: Logger;

    constructor(logger: Logger) {
        this.logger = logger.createScopedLogger("PickupReaper", true /* increment depth */);
    }

    public run(): void {
        this.logger.info("reaper is running...");
    }
}
