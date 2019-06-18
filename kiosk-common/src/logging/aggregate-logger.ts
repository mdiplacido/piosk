import { ConsoleLogger } from "./console-logger";
import { FileLogger } from "./file-logger";
import { handleOptionalParamLog } from "./log-util";
import { Logger } from "./logger";

export class AggregateLogger implements Logger {
    constructor(private readonly consoleLogger: ConsoleLogger, private readonly fileLogger: FileLogger) {
    }

    verbose(message: any, ...optionalParams: any[]): void {
        this.logImpl(this.consoleLogger, this.consoleLogger.verbose, message, optionalParams);
        this.logImpl(this.fileLogger, this.fileLogger.verbose, message, optionalParams);
    }

    log(message: any, ...optionalParams: any[]): void {
        this.verbose(message, optionalParams);
    }

    error(message: any, ...optionalParams: any[]): void {
        this.logImpl(this.consoleLogger, this.consoleLogger.error, message, optionalParams);
        this.logImpl(this.fileLogger, this.fileLogger.error, message, optionalParams);
    }

    warn(message: any, ...optionalParams: any[]): void {
        this.logImpl(this.consoleLogger, this.consoleLogger.warn, message, optionalParams);
        this.logImpl(this.fileLogger, this.fileLogger.warn, message, optionalParams);
    }

    info(message: any, ...optionalParams: any[]): void {
        this.logImpl(this.consoleLogger, this.consoleLogger.info, message, optionalParams);
        this.logImpl(this.fileLogger, this.fileLogger.info, message, optionalParams);
    }

    createScopedLogger(scope: string, incrementScopeDepth?: boolean): Logger {
        return new AggregateLogger(
            this.consoleLogger.createScopedLogger(scope, incrementScopeDepth),
            this.fileLogger.createScopedLogger(scope));
    }

    private logImpl(
        instance: ConsoleLogger | FileLogger,
        logFunc: (
            message: any,
            ...optionalParams: any[]) => void,
        message: any,
        optionalParams: any[]): void {
        handleOptionalParamLog(instance, logFunc, message, optionalParams);
    }
}