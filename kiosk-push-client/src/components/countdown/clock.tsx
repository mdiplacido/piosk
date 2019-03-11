import * as React from "react";

import { ICaptureConfig } from "../../providers/config/config";

export interface ClockProps {
    hours: number;
    minutes: number;
    seconds: number;
}

const Clock = (props: ClockProps) => {
    return (
        <span>
            {props.hours.toString().padStart(2, "0")}:{props.minutes.toString().padStart(2, "0")}:{props.seconds.toString().padStart(2, "0")}
        </span>
    );
};

const MillisecondsInHour = 60 * 60 * 1000;
const MillisecondsInMinute = 60 * 1000;
const MillisecondsInSecond = 1000;

const calcTime = (unitMilliseconds: number) => (remaining: number) => {
  const total = Math.floor(remaining / unitMilliseconds);

  return {
    total,
    remaining: remaining - (total * unitMilliseconds)
  };
};

const calcHours = calcTime(MillisecondsInHour);
const calcMinutes = calcTime(MillisecondsInMinute);
const calcSeconds = calcTime(MillisecondsInSecond);

export function getClockParamsFromConfig(config: ICaptureConfig) {
    const now = new Date();
    const interval = config.captureIntervalSeconds * 1000;
    // if we we don't have a last capture we just compute it now - interval, this will show the time
    // as elapsed eg. 00:00:00
    const lastCapture = new Date(config.lastCapture || (now.getTime() - interval));
    const nextCaptureTime = new Date(lastCapture.getTime() + interval);

    // if time remaining is negative then we assume we have elapsed and just set the remaining
    // to zero.
    const remaining = Math.max(nextCaptureTime.getTime() - now.getTime(), 0);
    const hours = calcHours(remaining);
    const minutes = calcMinutes(hours.remaining);
    const seconds = calcSeconds(minutes.remaining);

    return {
        hours: hours.total,
        minutes: minutes.total,
        seconds: seconds.total
    };
}

export default Clock;