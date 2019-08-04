import {
    BrowserWindowLifeCycleManager,
    OnBrowserLifeCycleEventListener
    } from "./browser-window-life-cycle-manager";
import {
    CaptureStatus,
    ConfigState,
    ConfigStore,
    ICaptureConfig,
    PickupStates
    } from "./../config/config";
import {
    ILoggerActionCreator,
    LoggerSeverity
    } from "../../store/logger/actions";
import { IPublisherService } from "../capture-publisher/publisher.provider";

function normManagerName(name: string): string {
    // TODO: we should probably use a UUID to represent the manager config
    return name.trim().toLowerCase();
}

export class CaptureService {
    private browserManagers = new Map<string, BrowserWindowLifeCycleManager>();

    public process(publisher: IPublisherService, configStore: ConfigStore, loggerActions: ILoggerActionCreator) {
        const now = new Date();
        const configs = configStore.captureConfigs();

        const pending = configs.filter(c => this.canPickup(c, now));

        if (!pending.length) {
            loggerActions.next("no pending captures to process", LoggerSeverity.Verbose);
            return;
        }

        // make sure the publisher is not falling behind, paused, or some other issue
        if (!publisher.canEnqueue()) {
            loggerActions.next("Cannot process captures, the publisher queue is full!", LoggerSeverity.Warning);
            return;
        }

        // we lazily create the managers.  we do this because the config could have changed which
        // introduced a new manager
        this.ensureBrowserManagers(configStore, loggerActions);

        // we will go through and start all the managers that are due
        // the assumption is they should not currently be running, but we could have a sanity check for that too.
        // probably better to use a map.
        const configChange: Partial<ConfigState> = {
            captureConfigs: pending.map(p => ({
                ...p,
                additionalData: {
                    ...p.additionalData,
                    status: CaptureStatus.PickedUp
                }
            }))
        };

        // it should be safe to perform this type of config state change as this was triggered by a prop change,
        // we should have the latest config state here.
        configStore.update(configChange, true /* silent */);

        // start the new captures.
        pending
            .map(pending => this.browserManagers.get(normManagerName(pending.name)) as BrowserWindowLifeCycleManager)
            .forEach(async mgr => {
                try {
                    await mgr.run(publisher);
                } catch (error) {
                    loggerActions.next(`fatal error running capture window for '${mgr.name}' error ${JSON.stringify(error)}`, LoggerSeverity.Error);
                }
            });
    }

    private ensureBrowserManagers(configStore: ConfigStore, loggerActions: ILoggerActionCreator): void {
        for (const config of configStore.captureConfigs()) {
            if (!this.browserManagers.has(normManagerName(config.name))) {
                loggerActions.next(`JIT Creating capture manager for '${config.name}'`, LoggerSeverity.Info);
                const manager = new BrowserWindowLifeCycleManager(
                    configStore.settings,
                    config,
                    this.makeBrowserManagerLifeCycleListener(configStore, loggerActions));
                this.browserManagers.set(normManagerName(config.name), manager);
            }
        }
    }

    private makeBrowserManagerLifeCycleListener(configStore: ConfigStore, loggerActions: ILoggerActionCreator): OnBrowserLifeCycleEventListener {
        // NOTE: the handler closure state can be stale, so we should never assume that reading a value from that state,
        // projecting a new state, and then dispatching that new state into redux is a safe operation.  we should rely on redux
        // to handle any specific action.  we are okay with dirty reads for now, but we should never dirty read then write.
        const handler: OnBrowserLifeCycleEventListener = (lifeCycle, status, config, callingMgr) => {
            loggerActions.next(`Capture: ${config.name} status: ${status} life-cycle: ${lifeCycle}`, LoggerSeverity.Info);
            // we only want to update the state of the capture config, and the Browser manager may have an old copy.
            // so we just update the status of the existing config
            const existing = configStore.settings.captureConfigs.find(c => c.name.toLowerCase() === config.name.toLowerCase());

            // if the manager is no longer managing a window then we'll remove it from our manager cache
            if (!callingMgr.isVisible) {
                loggerActions.next(
                    `Manager for config ${config.name} is no longer visible, will be make visible on next capture run`,
                    LoggerSeverity.Verbose);
            }

            if (!existing) {
                // TODO: execution of the capture configure will continue.  we should probably allow the manager to provide a hook
                // to abort processing eg. abort() this simply would set a closure boolean to true that the manager can check
                loggerActions.next(`Cannot update status, capture config '${config.name}' cannot be found!`, LoggerSeverity.Warning);
                return;
            }

            configStore.saveCaptureStatus(config.name, status);
        };

        return handler;
    }

    private canPickup(captureConfig: ICaptureConfig, now: Date): boolean {
        // three cases so far, 1) we have not picked up before or we have come due 2) the capture config is in a pickup state 3) the manager
        // that last managed this capture is also in a pickup state, iow not processing.
        const lastProcessingManager = this.browserManagers.get(normManagerName(captureConfig.name));

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