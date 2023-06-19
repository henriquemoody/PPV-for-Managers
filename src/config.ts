const properties = PropertiesService.getScriptProperties();

export enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3,
}

function propertyValue(property: string, defaultValue: any): any {
    const value = properties.getProperty(property);

    if (value === null) {
        return defaultValue;
    }

    return JSON.parse(value);
}

export const NOTION_TOKEN = properties.getProperty('NOTION_TOKEN');

export const CALENDAR_IDS = JSON.parse(properties.getProperty('CALENDAR_IDS')) as Record<string, string>;

export const CALENDAR_DENY_LIST = propertyValue('CALENDAR_DENY_LIST', []) as Array<string>;

export const DAYS_DATABASE_ID = properties.getProperty('DAYS_DATABASE_ID');
export const SCHEDULES_DATABASE_ID = properties.getProperty('SCHEDULES_DATABASE_ID');
export const TASKS_DATABASE_ID = properties.getProperty('TASKS_DATABASE_ID');
export const WEEKS_DATABASE_ID = properties.getProperty('WEEKS_DATABASE_ID');

export const LOGGER_LEVEL = <LogLevel>propertyValue('LOGGER_LEVEL', LogLevel.INFO);
export const LOGGER_SHOWN_AFTER_ERROR = <number>propertyValue('LOGGER_SHOWN_AFTER_ERROR', 5);

export const DATE_TIMEZONE = <string>propertyValue('DATE_TIMEZONE', 'CET');

export const DRY_RUN_MODE = <boolean>propertyValue('DRY_RUN_MODE', false);

export const ARCHIVE_CANCELLED_EVENTS = <boolean>propertyValue('ARCHIVE_CANCELLED_EVENTS', true);
export const DELETE_CANCELLED_EVENTS = <boolean>propertyValue('DELETE_CANCELLED_EVENTS', true);
export const UPDATE_CHANGED_EVENTS = <boolean>propertyValue('UPDATE_CHANGED_EVENTS', true);

export const RELATIVE_MAX_DAY = <number>propertyValue('RELATIVE_MAX_DAY', 15);
export const RELATIVE_MIN_DAY = <number>propertyValue('RELATIVE_MIN_DAY', 0);
