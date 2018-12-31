// tslint:disable:no-submodule-imports
// tslint:disable:no-expression-statement
import * as chokidar from 'chokidar';
import { Stats } from 'fs';
import { empty as observableEmpty, ReplaySubject, Subject } from 'rxjs';
import { catchError, filter, mergeMap, takeUntil, tap } from 'rxjs/operators';
import * as WebSocket from 'ws';

import { ReadFileStream } from './io/read-file-stream';

const PICKUP_DIRECTORY = "/tmp/screencap";

interface PathStatsPair {
    readonly path: string;
    readonly stats: Stats;
}

// we will replay the last n file events
const fileChangeSource = new ReplaySubject<PathStatsPair>(10);

const wss = new WebSocket.Server({ port: 8080 });

const PATH_FILTER_PREDICATE =
    (pathStats: PathStatsPair) => !!pathStats && pathStats.path.toLowerCase().endsWith(".png");

// start watcher for new and changing files.
const watcher = chokidar.watch(PICKUP_DIRECTORY, {
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
        console.log(`got to watcher:add path is '${path}'`)
        fileChangeSource.next({ path, stats });
    })
    .on("change", (path, stats: Stats) => {
        console.log(`got to watcher:change path is '${path}'`)
        fileChangeSource.next({ path, stats });
    });

wss.on('connection', ws => {
    const wsClosed = new Subject();

    ws.on('message', message => {
        console.log('received: %s', message);
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
            tap(({ path }) => console.log(`attempting to read file ${path}`)),
            mergeMap(pathStats =>
                ReadFileStream.fromPath(pathStats.path).pipe(
                    catchError(error => {
                        // we have to catch errors so we keep the stream alive.
                        console.error(`got retriable error: ${error}`);
                        return observableEmpty();
                    }))
            ),
            // if we get this far we are unwatching that means if a file reappears for some reason we will not see
            // it from the watcher again.  don't see why this would be necessary.
            tap(({ path }) => {
                console.log(`unwatching path: ${path}`)
                watcher.unwatch(path)
            })
        )
        // not it is possible for files to be replayed that are no longer on disk, this will be handled and logged
        // in the error block here
        .subscribe(({ data }) => ws.send(data.toString('base64')), err => console.error(`got terminal Error! - ${err}`));
});
