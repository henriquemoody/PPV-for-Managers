import {LOGGER_LEVEL, LOGGER_SHOWN_AFTER_ERROR, LogLevel} from '../config';

const LOGS = [];

export default class Logger {
    static debug(formatOrObject: object | string, ...values: any[]) {
        if (LogLevel.DEBUG >= LOGGER_LEVEL) {
            console.log(formatOrObject, ...values);
            return;
        }

        LOGS.push([LogLevel.DEBUG, formatOrObject, ...values]);
    }

    static info(formatOrObject: object | string, ...values: any[]) {
        if (LogLevel.INFO >= LOGGER_LEVEL) {
            console.info(formatOrObject, ...values);
            return;
        }

        LOGS.push([LogLevel.INFO, formatOrObject, ...values]);
    }

    static warn(formatOrObject: object | string, ...values: any[]) {
        if (LogLevel.WARN >= LOGGER_LEVEL) {
            console.warn(formatOrObject, ...values);
        }

        LOGS.push([LogLevel.WARN, formatOrObject, ...values]);
    }

    static error(formatOrObject: object | string, ...values: any[]) {
        this.flush();
        console.error(formatOrObject, ...values);
    }

    private static flush() {
        const mapping = new Map([
            [LogLevel.DEBUG, console.log],
            [LogLevel.INFO, console.info],
            [LogLevel.WARN, console.warn],
            [LogLevel.ERROR, console.error],
        ]);
        const latestLogs = LOGS.slice(-LOGGER_SHOWN_AFTER_ERROR);

        for (let i = 0; i < latestLogs.length; i++) {
            const args = latestLogs[i];
            const level = args.shift();
            mapping.get(level)(...args);
        }

        LOGS.length = 0;
    }
}
