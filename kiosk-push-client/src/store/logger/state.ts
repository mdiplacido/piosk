import { LoggerSeverity } from "./actions";

export interface ILogEntry {
    sequence?: number;
    message: string;
    severity: LoggerSeverity;
    stamp: Date;
}

export default interface IState {
    logs: {
        nextSequenceId: number;
        entries: ILogEntry[]
    };
}