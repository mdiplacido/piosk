import * as fs from 'fs';
import { Observable } from 'rxjs';

// tslint:disable-next-line:no-class
export class ReadFileStream {
    public static fromPath(path: string): Observable<{ readonly data: Buffer, readonly path: string }> {
        return new Observable(observer => {
            // tslint:disable-next-line:no-expression-statement
            fs.readFile(path, (err: NodeJS.ErrnoException, data: Buffer) => {
                // tslint:disable-next-line:no-if-statement
                if (err) {
                    // tslint:disable-next-line:no-expression-statement
                    observer.error(err);
                    return;
                }

                // tslint:disable-next-line:no-expression-statement
                observer.next({ data, path });
                // tslint:disable-next-line:no-expression-statement
                observer.complete();
            });

            return () => {
                // no-op 
            }
        });
    }
}