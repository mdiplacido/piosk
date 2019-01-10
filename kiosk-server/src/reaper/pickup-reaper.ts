import * as _ from 'lodash';
import { Config } from './../config/config';
import { Logger } from '../logging/logger';
import { readdir, stat } from 'fs-extra';
import { unlink } from 'fs-extra';

export class PickupReaper {
    private readonly logger: Logger;

    constructor(private readonly config: Config, logger: Logger) {
        this.logger = logger.createScopedLogger("PickupReaper", true /* increment depth */);
    }

    public run(): void {
        this.logger.info(`reaper is running, will run every ${this.config.reapIntervalSeconds} seconds...`);
        this.scheduleNextReap();
    }

    private scheduleNextReap(): void {
        setTimeout(async () => {
            try {
                const result = await this.reapImpl();
                this.logger.info(`Reaper run completed, removed ${result.removed} files, failed to remove ${result.failed} files`);
            } catch (error) {
                this.logger.error(`Get error ${error} durning reaper run`);
            } finally {
                this.scheduleNextReap();
            }
        }, this.config.reapIntervalSeconds * 1000);
    }

    private async reapImpl(): Promise<{ removed: number, failed: number }> {
        this.logger.verbose("In reap handler");
        const result = await this.findFilesToRemove(this.config.pickupDirectory, this.config.pickupQuotaMb);

        this.logger.info(`have ${result.remove.length} files to remove totaling ${result.removeBytes} bytes`);
        this.logger.info(`keeping ${result.keep.length} files totaling ${result.totalBytes - result.removeBytes} bytes`);

        let failed = 0, success = 0;

        for (var file of result.remove) {
            try {
                await unlink(file);
                success++;
            } catch (error) {
                failed++;
                this.logger.error(`failed to remove file ${file}, got error ${error}`);
            }
        }

        return Promise.resolve({ removed: success, failed });
    }

    private async findFilesToRemove(path: string, quotaMb: number): Promise<{
        remove: string[],
        keep: string[],
        totalBytes: number,
        removeBytes: number
    }> {
        // we find all the files in the folder and we keep the most recent files under our allowed quotaMb taking 90% of the quotaMb.
        // if we don't keep some percentage under then we could thrash and be in a constant state of cleanup assuming a steady stream of incoming data.
        const files = (await readdir(path)).map(f => path + "/" + f);
        const bytesInMegabyte = 1024 ** 2;
        const allowedBytes = quotaMb * bytesInMegabyte * .9;

        // 1. sort all the files from newest to oldest
        // 2. accumulate the bytes form newest to oldest
        // 3. only keep those files under the threshold maxAllowedDirectoryBytes
        // 4. the files not in that set are our candidates, return those to the caller.

        // NOTE: a big recent file (of quota size) would push all older files out.  this is not a likely scenario anyway, but 
        // since we are thinking of the pickup directory as a fifo queue then the old must be purged first even if one file
        // ends up pushing many out.

        const filesStats = await Promise.all(files.map(f => stat(f)));

        const filesWithStats = _.zip(files, filesStats).map(([file, stats]) => ({ file, stats }));

        // b - a gives reverse sort where the most recent files are at the head of the list
        const sortedFiles = filesWithStats.sort((a, b) => b.stats.ctime.getTime() - a.stats.ctime.getTime());

        const initialValue = { remove: [] as string[], keep: [] as string[], totalBytes: 0, removeBytes: 0 };

        const canKeep = (accBytes: number, currBytes: number) => accBytes + currBytes <= allowedBytes;

        const result = sortedFiles.reduce((prev, curr) => ({
            remove: !canKeep(prev.totalBytes, curr.stats.size) ? [...prev.remove, curr.file] : prev.remove,
            keep: canKeep(prev.totalBytes, curr.stats.size) ? [...prev.keep, curr.file] : prev.keep,
            totalBytes: prev.totalBytes + curr.stats.size,
            removeBytes: !canKeep(prev.totalBytes, curr.stats.size) ? prev.removeBytes + curr.stats.size : prev.removeBytes
        }), initialValue);

        return result;
    }
}
