import * as chokidar from 'chokidar';
import * as WebSocket from 'ws';
import {
    catchError,
    filter,
    mergeMap,
    takeUntil,
    tap
    } from 'rxjs/operators';
import { Config } from './config/config';
import { empty as observableEmpty, ReplaySubject, Subject } from 'rxjs';
import { existsSync, mkdirpSync, Stats } from 'fs-extra';
import { Logger } from './logging/logger';
import { PickupReaper } from './reaper/pickup-reaper';
import { ReadFileStream } from './io/read-file-stream';

interface PathStatsPair {
    readonly path: string;
    readonly stats: Stats;
}

const PATH_FILTER_PREDICATE =
    (pathStats: PathStatsPair) => !!pathStats && pathStats.path.toLowerCase().endsWith(".png");

export class App {
    private readonly logger: Logger;
    private readonly fileChangeSource = new ReplaySubject<PathStatsPair>(10);
    private readonly wss = new WebSocket.Server({ port: this.config.port });
    private readonly reaper: PickupReaper;
    private fileSystemWatcher: chokidar.FSWatcher;

    constructor(private readonly config: Config, logger: Logger) {
        this.logger = logger.createScopedLogger("App", true /* increment depth */);
        this.reaper = new PickupReaper(this.config, this.logger);
    }

    public run(): void {
        this.ensurePickupDirectory();
        this.setupFileSystemWatcher();
        this.listenOnWebSocket();
        this.startReaper();
        this.logger.info("WebSocket Server Running...");
    }

    private listenOnWebSocket(): void {
        this.wss.on('connection', (ws, req) => {
            this.logger.info(`Got new client connection from remote: ${req.connection.remoteAddress}`);
            const wsClosed = new Subject();

            ws.on('message', message => {
                this.logger.info(`received: ${message} from client`);
            });

            ws.on('close', () => {
                this.logger.info(`closing connection with client: ${req.connection.remoteAddress}`);
                wsClosed.next();
                wsClosed.complete();
            });

            // here we setup a subscription to the FS change source and assuming the client is still connected
            // eg. "wsClosed" has not emitted then we read the file and push it back down to the client.
            this.fileChangeSource
                .pipe(
                    takeUntil(wsClosed),
                    filter(PATH_FILTER_PREDICATE),
                    tap(({ path }) => this.logger.verbose(`attempting to read file ${path}`)),
                    mergeMap(pathStats =>
                        ReadFileStream.fromPath(pathStats.path).pipe(
                            catchError(error => {
                                // we have to catch errors so we keep the stream alive.
                                this.logger.error(`got retriable error: ${error}`);
                                return observableEmpty();
                            }))
                    ),
                    // if we get this far we are un-watching that means if a file reappears for some reason we will not see
                    // it from the watcher again.  don't see why this would be necessary.
                    tap(({ path }) => {
                        this.logger.verbose(`un-watching path: ${path}`)

                        try {
                            this.fileSystemWatcher.unwatch(path)
                        } catch (error) {
                            this.logger.error(`failed to un-watch the path ${path}`);
                        }
                    })
                )
                // not it is possible for files to be replayed that are no longer on disk, this will be handled and logged
                // in the error block here
                .subscribe(({ data, path }) => {
                    this.logger.verbose(`sending file ${path} to client: ${ req.connection.remoteAddress }`);
                    ws.send(data.toString('base64'), error => error && this.logger.error(`got error ${error} sending to client`));
                }, err => this.logger.error(`got terminal Error! - ${err}`));
        });
    }

    private startReaper(): void {
        if (!this.config.isReaperEnabled) {
            this.logger.warn("Reaper is not enabled, pickup directory can overflow");
            return;
        }

        this.reaper.run();
    }

    private setupFileSystemWatcher(): void {
        this.fileSystemWatcher = chokidar.watch(this.config.pickupDirectory, {
            alwaysStat: true,
            // wait for writes to have been stable for 2 seconds, check for changes every 100ms.
            // i guess the thinking is that the latest you would know is after 2100 ms.
            awaitWriteFinish: {
                pollInterval: 100,
                stabilityThreshold: 2000,
            }
        });

        // watch for new files or changing files
        // NOTE: we cannot guarantee the order of the files, it's up to the client
        // to deal with sorting what it receives and dumping files it does not care
        // about.
        this.fileSystemWatcher
            .on("add", (path, stats: Stats) => {
                this.logger.verbose(`got to watcher:add path is '${path}'`)
                this.fileChangeSource.next({ path, stats });
            })
            .on("change", (path, stats: Stats) => {
                this.logger.verbose(`got to watcher:change path is '${path}'`)
                this.fileChangeSource.next({ path, stats });
            });
    }

    private ensurePickupDirectory(): void {
        // ensure that pickup directory exists.
        if (!existsSync(this.config.pickupDirectory + "/")) {
            this.logger.warn(`pickup directory ${this.config.pickupDirectory} does not exist, creating...`);
            // make recursive as the parent folder may not exist.
            mkdirpSync(this.config.pickupDirectory);
        }
    }
}