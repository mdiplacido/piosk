import { ILogEntry } from "../logger/state";

export interface INotification extends ILogEntry {
    dismissed?: boolean;
}

export default interface IState {
    notifications: {
        nextSequenceId: number;
        entries: INotification[];
    };
}