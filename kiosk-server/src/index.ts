import * as _ from "lodash";
import * as log4js from "log4js";
import { argv } from "yargs";

import { App } from "./app";
import { Config } from "./config/config";
import { AggregateLogger, ConsoleLogger, FileLogger } from "./logging";
import { dumpSettings } from "./utility/dump-settings";

// we read from a jailed location on the Pi, clients that push to the Pi push over SFTP and the SSHD jails these
// users this location on disk.
const DEFAULT_PICKUP_DIRECTORY = "/var/jail/data/piosk_pickup";
const DEFAULT_PORT = 8081;

const config: Config = {
    pickupDirectory: (argv.pickup || "").replace(/[\\\/]+$/, '') || DEFAULT_PICKUP_DIRECTORY,
    // has to be numeric and truthy
    port: +argv.port || DEFAULT_PORT,
    isReaperEnabled: _.isNil(argv.enableReaper) ? true : argv.enableReaper === "true",
    reapIntervalSeconds: +argv.reapIntervalSeconds || 60,
    pickupQuotaMb: +argv.pickupQuotaMb || 100,
    maxLogSizeBytes: +argv.maxLogSizeBytes || 1024 ** 2 * 10, // default is 10meg
    maxLogFiles: +argv.maxLogFiles || 3,
};

const fileLog = log4js
    .configure({
        appenders: { piosk: { type: 'file', filename: 'piosk.log', maxLogSize: config.maxLogSizeBytes, backups: config.maxLogFiles } },
        categories: { default: { appenders: ['piosk'], level: 'ALL' } }
    });

const fileLogImpl = fileLog.getLogger();

const fileLogger = new FileLogger(fileLogImpl, "Main");
const consoleLogger = new ConsoleLogger("Main");

const logger = new AggregateLogger(consoleLogger, fileLogger);

process.on('uncaughtException', (err) => {
    logger.error(`uncaughtException: ${err.message}`);
    logger.error(`stack: ${err.stack}`);
    fileLog.shutdown(() => process.exit(1));
})

dumpSettings(config, logger);

const app = new App(config, logger);
app.run();
