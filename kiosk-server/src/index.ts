import * as _ from "lodash";
import * as log4js from "log4js";
import { argv } from "yargs";

import { App } from "./app";
import { Config } from "./config/config";
import { AggregateLogger } from "./logging/aggregate-logger";
import { ConsoleLogger } from "./logging/console-logger";
import { FileLogger } from "./logging/file-logger";
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
};

const fileLoggerImp = log4js
    .configure({
        appenders: { piosk: { type: 'file', filename: 'piosk.log' } },
        categories: { default: { appenders: ['piosk'], level: 'ALL' } }
    })
    .getLogger();

const fileLogger = new FileLogger(fileLoggerImp, "Main");
const consoleLogger = new ConsoleLogger("Main");

const logger = new AggregateLogger(consoleLogger, fileLogger);

process.on('uncaughtException', (err) => {
    // intentionally logging in one log statement.  seems that with multiple log statements
    // the file does not not get the second log statement flushed to disk.
    logger.error(`uncaughtException: ${err.message} stack: ${err.stack}`);
    process.exit(1)
})

dumpSettings(config, logger);

const app = new App(config, logger);
app.run();
