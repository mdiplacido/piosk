// tslint:disable:no-submodule-imports
// tslint:disable:no-expression-statement
import * as chokidar from "chokidar";
import { existsSync, mkdirSync, Stats } from "fs";
import { empty as observableEmpty, ReplaySubject, Subject } from "rxjs";
import { catchError, filter, mergeMap, takeUntil, tap } from "rxjs/operators";
import * as WebSocket from "ws";
import { argv } from "yargs";

import { Config } from "./config/config";
import { ReadFileStream } from "./io/read-file-stream";
import { ConsoleLogger } from "./logging/console-logger";
import { dumpSettings } from "./utility/dump-settings";

// we read from a jailed location on the Pi, clients that push to the Pi push over SFTP and the SSHD jails these
// users this location on disk.
const DEFAULT_PICKUP_DIRECTORY = "/var/jail/data/piosk_pickup";
const DEFAULT_PORT = 8081;

interface PathStatsPair {
    readonly path: string;
    readonly stats: Stats;
}

const config: Config = {
    pickupDirectory: (argv.pickup || "").replace(/[\\\/]+$/, '') || DEFAULT_PICKUP_DIRECTORY,
    // has to be numeric and truthy
    port: +argv.port || DEFAULT_PORT,
};

const logger = new ConsoleLogger("App")
dumpSettings(config, logger);

// ensure that pickup directory exists.
if (!existsSync(config.pickupDirectory + "/")) {
    logger.warn(`pickup directory ${config.pickupDirectory} does not exist, creating...`);
    mkdirSync(config.pickupDirectory + "/");
}

// we will replay the last n file events
const fileChangeSource = new ReplaySubject<PathStatsPair>(10);

const wss = new WebSocket.Server({ port: config.port });

const PATH_FILTER_PREDICATE =
    (pathStats: PathStatsPair) => !!pathStats && pathStats.path.toLowerCase().endsWith(".png");

// start watcher for new and changing files.
const watcher = chokidar.watch(config.pickupDirectory, {
    alwaysStat: true,
    // wait for writes to have been stable for 2 seconds, check for changes every 100ms.
    // i guess the thinking is that the latest you would know is after 2100 ms.
    awaitWriteFinish: {
        pollInterval: 100,
        stabilityThreshold: 2000,
    }
});

// TODO: we need a reaper to remove files that are older than some threshold.

// watch for new files or changing files
// NOTE: we cannot guarantee the order of the files, it's up to the client
// to deal with sorting what it receives and dumping files it does not care
// about.
watcher
    .on("add", (path, stats: Stats) => {
        logger.verbose(`got to watcher:add path is '${path}'`)
        fileChangeSource.next({ path, stats });
    })
    .on("change", (path, stats: Stats) => {
        logger.verbose(`got to watcher:change path is '${path}'`)
        fileChangeSource.next({ path, stats });
    });

wss.on('connection', (ws, req) => {
    logger.info(`Got new client connection from remote: ${req.connection.remoteAddress}`);
    const wsClosed = new Subject();

    ws.on('message', message => {
        logger.info('received: %s', message);
    });

    ws.on('close', () => {
        wsClosed.next();
        wsClosed.complete();
    });

    // tslint:disable-next-line:no-expression-statement
    fileChangeSource
        .pipe(
            takeUntil(wsClosed),
            filter(PATH_FILTER_PREDICATE),
            tap(({ path }) => logger.verbose(`attempting to read file ${path}`)),
            mergeMap(pathStats =>
                ReadFileStream.fromPath(pathStats.path).pipe(
                    catchError(error => {
                        // we have to catch errors so we keep the stream alive.
                        logger.error(`got retriable error: ${error}`);
                        return observableEmpty();
                    }))
            ),
            // if we get this far we are unwatching that means if a file reappears for some reason we will not see
            // it from the watcher again.  don't see why this would be necessary.
            tap(({ path }) => {
                logger.verbose(`unwatching path: ${path}`)
                watcher.unwatch(path)
            })
        )
        // not it is possible for files to be replayed that are no longer on disk, this will be handled and logged
        // in the error block here
        .subscribe(({ data }) => ws.send(data.toString('base64')), err => logger.error(`got terminal Error! - ${err}`));
});

logger.info("running...");