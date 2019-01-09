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
    private fileSystemWatcher: chokidar.FSWatcher;

    constructor(private readonly config: Config, logger: Logger) {
        this.logger = logger.createScopedLogger("App", true /* increment depth */);
    }

    public run(): void {
        this.ensurePickupDirectory();
        this.setupFileSystemWatcher();
        this.listenOnWebSocket();
        this.startReaper();
        this.logger.info("Running...");
    }

    private listenOnWebSocket(): void {
        this.wss.on('connection', (ws, req) => {
            this.logger.info(`Got new client connection from remote: ${req.connection.remoteAddress}`);
            const wsClosed = new Subject();

            ws.on('message', message => {
                this.logger.info('received: %s from client', message);
            });

            ws.on('close', () => {
                wsClosed.next();
                wsClosed.complete();
            });

            // tslint:disable-next-line:no-expression-statement
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
                        this.fileSystemWatcher.unwatch(path)
                    })
                )
                // not it is possible for files to be replayed that are no longer on disk, this will be handled and logged
                // in the error block here
                .subscribe(({ data }) => ws.send(data.toString('base64')), err => this.logger.error(`got terminal Error! - ${err}`));
        });
    }

    private startReaper(): void {
        this.logger.info("Starting reaper...");
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