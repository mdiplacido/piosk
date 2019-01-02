import * as chalk from 'chalk';

import { Logger } from './logger';

/**
 * here order matters, the app when it boots will set this level, if set to none
 * then no logging will be performed
 *
 * @export
 * @enum {number}
 */
export enum LogLevel {
    verbose,
    log,
    info,
    warn,
    error,
    none
}

/**
 * Simple logger class that will determine if it needs to log based on
 * the current log level.
 *
 * @export
 * @class ConsoleLogger
 * @implements {ILogger}
 */
export class ConsoleLogger implements Logger {
    private readonly name: string;
    private readonly chalkInst = chalk as any;

    constructor(name: string = "root", private minLogLevel = LogLevel.verbose, private scopeDepth = 0) {
        this.name = `[${name}]`;
    }

    // tslint:disable-next-line:readonly-array
    public verbose(message: any, ...optionalParams: any[]): void {
        this.logImpl(console.log, LogLevel.verbose, this.chalkInst.yellow, message, optionalParams);
    }

    // tslint:disable-next-line:readonly-array
    public log(message: any, ...optionalParams: any[]): void {
        this.logImpl(console.log, LogLevel.log, null /* default color */, message, optionalParams);
    }

    // tslint:disable-next-line:readonly-array
    public info(message: any, ...optionalParams: any[]): void {
        this.logImpl(console.info, LogLevel.info, this.chalkInst.yellow, message, optionalParams);
    }

    // tslint:disable-next-line:readonly-array
    public warn(message: any, ...optionalParams: any[]): void {
        this.logImpl(console.warn, LogLevel.warn, this.chalkInst.yellow, message, optionalParams);
    }

    // tslint:disable-next-line:readonly-array
    public error(message: any, ...optionalParams: any[]): void {
        this.logImpl(console.error, LogLevel.error, this.chalkInst.red, message, optionalParams);
    }

    public createScopedLogger(scope: string, incrementScopeDepth = true): ConsoleLogger {
        return new ConsoleLogger(scope, this.minLogLevel, incrementScopeDepth ? this.scopeDepth + 1 : this.scopeDepth);
    }

    private logImpl(logFunc: (
        message: any,
        // tslint:disable-next-line:readonly-array
        ...optionalParams: any[]) => void,
        level: LogLevel,
        // tslint:disable-next-line:ban-types
        color: Function,
        message: any,
        // tslint:disable-next-line:readonly-array
        optionalParams: any[]): void {
        if (this.minLogLevel > level) {
            return;
        }

        let messageWithPrefix = this.makeLogPrefix(message, level);

        if (color) {
            messageWithPrefix = color.apply(color, [messageWithPrefix]);
        }

        if (!optionalParams || optionalParams.length === 0) {
            logFunc(messageWithPrefix);
        } else {
            logFunc.apply(console, [messageWithPrefix, ...optionalParams]);
        }
    }

    private makeLogPrefix(message: string, level: LogLevel): string {
        const indent = "\t".repeat(this.scopeDepth);
        const levelStamp = this.getLogLevelStamp(level);
        const time = (new Date()).toISOString();
        return `${time} ${levelStamp} ${indent}${this.name} ${message}`;
    }

    private getLogLevelStamp(level: LogLevel): string {
        switch (level) {
            case LogLevel.error:
                return "[Error]  ";
            case LogLevel.info:
                return "[Info]   ";
            case LogLevel.log:
                return "[Log]    ";
            case LogLevel.verbose:
                return "[Verbose]";
            case LogLevel.warn:
                return "[Warn]   ";
            default:
                return "[Unknown]";
        }
    }
}