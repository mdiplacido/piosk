import {
    ConfigState,
    ConfigStore
    } from "../config/config";
import {
    ILoggerActionCreator,
    LoggerSeverity
    } from "../../store/logger/actions";

export class CaptureService {
    // private renderWindow: BrowserWindow;

    public process(configStore: ConfigStore, loggerActions: ILoggerActionCreator) {
        const pending = configStore
            .captureConfigs()
            .filter(c =>
                (!c.lastCapture || new Date(c.lastCapture) < new Date())
                &&
                (!c.additionalData || c.additionalData && !c.additionalData.processing)
            );

        if (!pending.length) {
            loggerActions.next("no pending captures to process", LoggerSeverity.Verbose);
            return;
        }

        for (const captureConfig of pending) {
            loggerActions.next(`Processing capture config '${captureConfig.name}'`, LoggerSeverity.Info);
        }

        const configChange: Partial<ConfigState> = {
            captureConfigs: pending.map(p => ({
                ...p,
                additionalData: {
                    ...p.additionalData,
                    processing: true
                }
            }))
        };

        configStore.update(configChange, true /* silent */);
    }

    public loadUrl() {
        // this.renderWindow.loadURL(this.configState.url);
    }

    public maximize() {
        // this.renderWindow.setFullScreen(true);
    }

    public openWindow() {
        // this.renderWindow = new remote.BrowserWindow({
        //     webPreferences: {
        //         nodeIntegration: false,
        //         webSecurity: false /* probably should make this an option per capture */
        //     }
        // });

        // // this.renderWindow.loadURL(this.configState.url);

        // // todo: attaching the dev tools should be optional and may not be available depending on
        // // the build.
        // this.renderWindow.webContents.openDevTools();
    }

    // public screenshot(): Promise<Electron.NativeImage> {
    //     // return new Promise((resolve, reject) => {
    //     //     try {
    //     //         this.renderWindow.capturePage(image => resolve(image));
    //     //     } catch (error) {
    //     //         reject(error);
    //     //     }
    //     // });

    //     // fs.writeFile('/var/jail/data/piosk_pickup/test.png', img.toPNG(),
    //     //   () => {
    //     //     // callback, no-op for now
    //     //   }));
    // }
}