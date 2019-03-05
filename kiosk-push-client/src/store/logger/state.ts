import { LoggerSeverity } from "./actions";

export interface ILogEntry {
    message: string;
    severity: LoggerSeverity;
}

export default interface IState {
    logs: ILogEntry[];
}