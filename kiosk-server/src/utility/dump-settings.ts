import { Config } from '../config/config';
import { Logger } from '../logging/logger';

export function dumpSettings(config: Config, logger: Logger): void {
    logger.info("Running with config:");
    logger.info(JSON.stringify(config, null /* no replacement */, 4 /* spaces */));
}
