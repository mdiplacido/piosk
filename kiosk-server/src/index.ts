import { App } from './app';
import { argv } from 'yargs';
import { Config } from './config/config';
import { ConsoleLogger } from './logging/console-logger';
import { dumpSettings } from './utility/dump-settings';

// we read from a jailed location on the Pi, clients that push to the Pi push over SFTP and the SSHD jails these
// users this location on disk.
const DEFAULT_PICKUP_DIRECTORY = "/var/jail/data/piosk_pickup";
const DEFAULT_PORT = 8081;

const config: Config = {
    pickupDirectory: (argv.pickup || "").replace(/[\\\/]+$/, '') || DEFAULT_PICKUP_DIRECTORY,
    // has to be numeric and truthy
    port: +argv.port || DEFAULT_PORT,
};

const logger = new ConsoleLogger("Main")
dumpSettings(config, logger);

const app = new App(config, logger);
app.run();
