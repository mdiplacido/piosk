import { Logger } from "./logging/logger";

export class App {
    private readonly logger: Logger;

    constructor(logger: Logger) {
        this.logger = logger.createScopedLogger("App", true /* increment depth */);
    }

    public run(): void {
        this.logger.info("Running...")
    }
}