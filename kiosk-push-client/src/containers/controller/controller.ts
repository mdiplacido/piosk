import { BrowserWindow, remote } from "electron";

import { ICaptureConfig } from "../../providers/config/config";

export class CaptureService {
    private renderWindow: BrowserWindow;

    constructor(private readonly config: ICaptureConfig) {
    }

    public loadUrl() {
        this.renderWindow.loadURL(this.config.url);
    }

    public maximize() {
        this.renderWindow.setFullScreen(true);
    }

    public openWindow() {
        this.renderWindow = new remote.BrowserWindow({
            webPreferences: {
                nodeIntegration: false,
                webSecurity: false /* probably should make this an option per capture */
            }
        });

        this.renderWindow.loadURL(this.config.url);

        // todo: attaching the dev tools should be optional and may not be available depending on
        // the build.
        this.renderWindow.webContents.openDevTools();
    }

    public screenshot(): Promise<Electron.NativeImage> {
        return new Promise((resolve, reject) => {
            try {
                this.renderWindow.capturePage(image => resolve(image));
            } catch (error) {
                reject(error);
            }
        });

        // fs.writeFile('/var/jail/data/piosk_pickup/test.png', img.toPNG(),
        //   () => {
        //     // callback, no-op for now
        //   }));
    }
}