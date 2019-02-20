export enum PublishCompletionStatus {
    None = "None",
    Success = "Success",
    Failure = "Failure"
}

export interface PublishCompletionEvent {
    status: PublishCompletionStatus;
    message: string;
}

export interface PublishService {
    send(): Promise<PublishCompletionEvent>;
}
