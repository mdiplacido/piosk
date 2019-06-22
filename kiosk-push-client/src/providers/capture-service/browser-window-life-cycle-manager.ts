import {
    BrowserWindow,
    remote
} from "electron";
import {
    CaptureStatus,
    ConfigState
} from "../config/config";
import { ICaptureConfig } from "../config/config";
import { IPublisherService, PublisherCompletionStatus, IPublishInfo } from '../capture-publisher/publisher.provider';
import * as uuid from "uuid";

export enum BrowserWindowLifeCycle {
    None = "none",
    LoadUrl = "load",
    ReadyToShow = "ready-to-show",
    EnterFullScreen = "enter-full-screen",
    Closed = "closed",
}

export type OnBrowserLifeCycleEventListener = (
    name: BrowserWindowLifeCycle,
    status: CaptureStatus,
    captureConfig: ICaptureConfig,
    mgr: BrowserWindowLifeCycleManager) => void;

export class BrowserWindowLifeCycleManager {
    private renderWindow: BrowserWindow;
    private readonly configState: ConfigState;
    private readonly captureConfig: ICaptureConfig;
    private status: CaptureStatus = CaptureStatus.None;
    private lifeCycleStage = BrowserWindowLifeCycle.None;
    private capture: Electron.NativeImage;

    public get name(): string {
        return this.captureConfig.name;
    }

    public get isVisible(): boolean {
        return this.renderWindow && this.renderWindow.isVisible();
    }

    public get lastStatus(): CaptureStatus {
        return this.status;
    }

    public get lastCapture(): Electron.NativeImage {
        return this.capture;
    }

    constructor(
        config: ConfigState,
        captureConfig: ICaptureConfig,
        private readonly onLifeCycleEventListener: OnBrowserLifeCycleEventListener) {

        // create a copy.
        this.configState = {
            ...config,
            captureConfigs: []
        };

        // create a copy.
        this.captureConfig = {
            ...captureConfig,
            additionalData: {
                ...captureConfig.additionalData || { status: CaptureStatus.None }
            }
        };
    }

    public async run(publisher: IPublisherService) {
        try {
            await this.runImpl(publisher);
        } catch (error) {
            this.renderWindow.close();
            this.renderWindow = null as unknown as BrowserWindow;
            this.updateState(CaptureStatus.Failed);
            throw error;
        }
    }

    private async runImpl(publisher: IPublisherService) {
        this.ensureRenderWindow();
        const settleDelay = this.configState.defaultPageSettleDelaySeconds;

        let lifeCycle: BrowserWindowLifeCycle = BrowserWindowLifeCycle.LoadUrl;
        {
            this.updateState(CaptureStatus.Loading, lifeCycle);
            this.loadUrl();

            lifeCycle = BrowserWindowLifeCycle.ReadyToShow;

            if (!this.renderWindow.isVisible()) {
                this.updateState(CaptureStatus.Settling, lifeCycle);
                await Promise.race([this.once(lifeCycle), this.delay(lifeCycle, settleDelay, true /* throw */)]);
                this.renderWindow.show();
                this.updateState(CaptureStatus.Loaded);
            }
        }

        lifeCycle = BrowserWindowLifeCycle.EnterFullScreen;

        if (!this.renderWindow.isMaximized()) {
            this.maximize();
            this.updateState(CaptureStatus.Settling, lifeCycle);
            // we do not really care if we can get into full screen mode, it doesn't seem very reliable anyway.
            // given that we will not throw if the fullscreen mode did not settle.
            await Promise.race([this.once(lifeCycle), this.delay(lifeCycle, settleDelay, false /* do not throw */)]);
        }

        {
            this.updateState(CaptureStatus.Capturing);
            this.capture = await Promise.race([this.screenshot(), this.delay(lifeCycle, settleDelay, true /* throw */)]) as Electron.NativeImage;
            this.updateState(CaptureStatus.Captured);
        }

        this.updateState(CaptureStatus.Publishing);
        // todo: publisher should use pngx format 
        const imageInfo: IPublishInfo = {
            name: uuid() + ".png",
            image: this.capture,
        };

        const publishStatus = await Promise.race([publisher.sendImage(imageInfo), this.delay(lifeCycle, settleDelay, true /* throw */)]);
        
        if (publishStatus && publishStatus.status && publishStatus.status === PublisherCompletionStatus.Failure) {
            this.updateState(CaptureStatus.Failed);
            throw new Error(`Failed to upload image for ${this.name}, got error ${publishStatus.message}`);
        } 

        this.updateState(CaptureStatus.Published);
    }

    private async once(event: "ready-to-show" | "enter-full-screen"): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                this.renderWindow.once(event as any, () => resolve());
            } catch (error) {
                reject(error);
            }
        });
    }

    private updateState(status: CaptureStatus, lifeCycle?: BrowserWindowLifeCycle): void {
        this.status = status;
        this.lifeCycleStage = lifeCycle || this.lifeCycleStage;
        this.onLifeCycleEventListener(this.lifeCycleStage, this.status, this.captureConfig, this);
    }

    private async delay(name: string, seconds = 2, throwIfReached = false): Promise<void> {
        return new Promise((resolve, reject) => {
            window.setTimeout(() =>
                throwIfReached && reject(`timeout reached waiting for '${name}'`) || resolve(), seconds * 1000);
        });
    }

    private ensureRenderWindow(): void {
        if (this.renderWindow) {
            return;
        }

        this.renderWindow = new remote.BrowserWindow({
            show: false,
            webPreferences: {
                nodeIntegration: false,
                webSecurity: false /* TODO: probably should make this an option per capture */
            }
        });

        this.renderWindow.on("closed", () => {
            this.renderWindow = null as unknown as BrowserWindow;
            this.updateState(CaptureStatus.Canceled, BrowserWindowLifeCycle.Closed);
        });
    }

    private loadUrl() {
        this.renderWindow.loadURL(this.captureConfig.url);
        // todo: attaching the dev tools should be optional and may not be available depending on
        // the build or setting in config
        // this.renderWindow.webContents.openDevTools();
    }

    private maximize() {
        this.renderWindow.setFullScreen(true);
    }

    private screenshot(): Promise<Electron.NativeImage> {
        return new Promise((resolve, reject) => {
            try {
                this.renderWindow.capturePage(image => resolve(image));
            } catch (error) {
                reject(error);
            }
        });
    }
}