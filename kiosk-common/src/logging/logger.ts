// tslint:disable:no-method-signature
// tslint:disable:readonly-array
export interface Logger {
    verbose(message: any, ...optionalParams: any[]): void;
    log(message: any, ...optionalParams: any[]): void;
    error(message: any, ...optionalParams: any[]): void;
    warn(message: any, ...optionalParams: any[]): void;
    info(message: any, ...optionalParams: any[]): void;
    createScopedLogger(scope: string, incrementScopeDepth?: boolean): Logger;
}
