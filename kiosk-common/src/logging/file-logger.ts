import { Logger as Log4JSLogger } from "log4js";

import { handleOptionalParamLog } from "./log-util";
import { Logger } from "./logger";

export class FileLogger implements Logger {
    constructor(private readonly logger: Log4JSLogger, private readonly name: string = "root") {
    }

    verbose(message: any, ...optionalParams: any[]): void {
        this.logImpl(this.logger.trace, this.makeLogPrefix(message), optionalParams);
    } 
    
    log(message: any, ...optionalParams: any[]): void {
        this.verbose(message, optionalParams);
    }

    error(message: any, ...optionalParams: any[]): void {
        this.logImpl(this.logger.error, this.makeLogPrefix(message), optionalParams);
    }

    warn(message: any, ...optionalParams: any[]): void {
        this.logImpl(this.logger.warn, this.makeLogPrefix(message), optionalParams);
    }

    info(message: any, ...optionalParams: any[]): void {
        this.logImpl(this.logger.info, this.makeLogPrefix(message), optionalParams);
    }

    createScopedLogger(scope: string): FileLogger {
        // we don't bother creating indented output here
        return new FileLogger(this.logger, scope);
    }

    private logImpl(
        logFunc: (
        message: any,
        ...optionalParams: any[]) => void,
        message: any,
        optionalParams: any[]): void {
        handleOptionalParamLog(this.logger, logFunc, message, optionalParams);
    }

    private makeLogPrefix(message: string): string {
        return `[${this.name}] ${message}`;
    }
}