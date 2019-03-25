import { BrowserWindowLifeCycleManager } from "./browser-window-life-cycle-manager";
import {
    CaptureStatus,
    ICaptureConfig,
    PickupStates
} from "./../config/config";
import {
    ConfigState,
    ConfigStore
} from "../config/config";
import {
    ILoggerActionCreator,
    LoggerSeverity
} from "../../store/logger/actions";

export class CaptureService {
    private windows: BrowserWindowLifeCycleManager[] = [];
    public process(configStore: ConfigStore, loggerActions: ILoggerActionCreator) {
        const now = new Date();

        const pending = configStore
            .captureConfigs()
            .filter(c => this.canPickup(c, now));

        if (!pending.length) {
            loggerActions.next("no pending captures to process", LoggerSeverity.Verbose);
            return;
        }

        // TODO: rather than new capture window lets just keep around the array of BrowserLifeCycleManagers, basically each capture config
        // gets its own manager, if one is not available we will create it.  we will go through and start all the managers that are due
        // the assumption is they should not currently be running, but we could have a sanity check for that too.
        // probably better to use a map.
        const newCaptureWindows: BrowserWindowLifeCycleManager[] = [];

        for (const captureConfig of pending) {
            loggerActions.next(`Creating capture manager for '${captureConfig.name}'`, LoggerSeverity.Info);
            newCaptureWindows.push(new BrowserWindowLifeCycleManager(configStore.settings, captureConfig, (lifeCycle, status, config, callingMgr) => {
                loggerActions.next(`Capture: ${config.name} status: ${status} life-cycle: ${lifeCycle}`, LoggerSeverity.Info);
                // we only want to update the state of the capture config, and the Browser manager may have an old copy.
                // so we just update the status of the existing config
                const existing = configStore.settings.captureConfigs.find(c => c.name.toLowerCase() === config.name.toLowerCase());

                // if the manager is no longer managing a window then we'll remove it from our manager cache
                // TODO: probably no need to do this if we decide to keep the managers around, but we might want to clean them up
                // if the related capture config gets deleted
                if (!callingMgr.isVisible) {
                    this.windows = this.windows.filter(mgr => mgr !== callingMgr);
                }

                if (!existing) {
                    // TODO: execution of the capture configure will continue.  we should probably allow the manager to provide a hook
                    // to abort processing eg. abort() this simply would set a closure boolean to true that the manager can check
                    loggerActions.next(`Cannot update status, capture config '${config.name}' cannot be found!`, LoggerSeverity.Warning);
                    return;
                }

                configStore.saveCaptureConfig({
                    ...existing,
                    additionalData: {
                        ...existing.additionalData,
                        status
                    }
                });
            }));
        }

        const configChange: Partial<ConfigState> = {
            captureConfigs: pending.map(p => ({
                ...p,
                additionalData: {
                    ...p.additionalData,
                    status: CaptureStatus.PickedUp
                }
            }))
        };

        configStore.update(configChange, true /* silent */);

        this.windows = [...this.windows, ...newCaptureWindows];

        // start the new captures.
        newCaptureWindows.forEach(async mgr => {
            try {
                await mgr.run();
            } catch (error) {
                loggerActions.next(`fatal error running capture window for '${mgr.name}' error ${error}`, LoggerSeverity.Error);
            }
        });
    }

    private canPickup(captureConfig: ICaptureConfig, now: Date): boolean {
        // three cases so far, 1) we have not picked up before or we have come due 2) the capture config is in a pickup state 3) the manager
        // that last managed this capture is also in a pickup state, iow not processing.
        const lastProcessingManager = this.windows.find(mgr => mgr.name === captureConfig.name.toLowerCase());

        return (!captureConfig.lastCapture || new Date(captureConfig.lastCapture.getTime() + captureConfig.captureIntervalSeconds * 1000) < now)
            && (
                !captureConfig.additionalData ||
                !captureConfig.additionalData.status ||
                PickupStates.some(
                    s => s === (captureConfig.additionalData && captureConfig.additionalData.status || CaptureStatus.None)))
            && (
                !lastProcessingManager || PickupStates.some(s => s === lastProcessingManager.lastStatus)
            );
    }
}