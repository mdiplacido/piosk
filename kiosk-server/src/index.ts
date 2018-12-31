// tslint:disable-next-line:no-submodule-imports
// tslint:disable:no-expression-statement
import * as chokidar from 'chokidar';
import * as fs from 'fs';
import { ReplaySubject, Subject } from 'rxjs';
import { debounceTime, filter, mergeMap, takeUntil, tap } from 'rxjs/operators';
import * as WebSocket from 'ws';

import { ReadFileStream } from './io/read-file-stream';

const PICKUP_DIRECTORY = "/tmp/screencap";

// we will replay the last n file events
const fileChangeSource = new ReplaySubject<string>(10);

const wss = new WebSocket.Server({ port: 8080 });

const PATH_FILTER_PREDICATE = (path: string) => !!path && path.toLowerCase().endsWith(".png");

// discover existing files
// seems to be reading files in the order they were written which is what we want... FIFO
fs.readdir(`${PICKUP_DIRECTORY}/`,
    // tslint:disable-next-line:variable-name
    (_err: NodeJS.ErrnoException, files: ReadonlyArray<string>) =>
        files.filter(PATH_FILTER_PREDICATE).forEach(
            f => fileChangeSource.next(f)));

// start watcher for new and changing files.
const watcher = chokidar.watch(PICKUP_DIRECTORY);

// watch for new files or changing files
watcher
    .on("add", path => fileChangeSource.next(path))
    .on("change", path => fileChangeSource.next(path));

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
            // no changes in 5 seconds then we emit. 
            // TODO: this probably should be done in a more robust way
            // maybe we should check to see if the file file modification date is older than 5 seconds, rather than
            // this implicit way of using debounce
            debounceTime(5000),
            // TODO: handle errors when reading file stream
            mergeMap(path => ReadFileStream.fromPath(path)),
            tap(({ path }) => watcher.unwatch(path))
        )
        .subscribe(({ data }) => ws.send(data.toString('base64')));
});
