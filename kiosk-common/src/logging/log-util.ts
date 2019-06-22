export function handleOptionalParamLog(
    instance: any,
    logFunc: (
    message: any,
    ...optionalParams: any[]) => void,
    message: any,
    optionalParams: any[]): void {

    if (!optionalParams || !optionalParams.length) {
        logFunc.apply(instance, [message]);
    } else {
        logFunc.apply(instance, [message, ...optionalParams]);
    }
}