const properties = PropertiesService.getScriptProperties();

export enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3,
}

export const CALENDAR_IDS = JSON.parse(properties.getProperty('CALENDAR_IDS')) as Record<string, string>;

export const DAYS_DATABASE_ID = properties.getProperty('DAYS_DATABASE_ID');
export const SCHEDULES_DATABASE_ID = properties.getProperty('SCHEDULES_DATABASE_ID');
export const TASKS_DATABASE_ID = properties.getProperty('TASKS_DATABASE_ID');
export const WEEKS_DATABASE_ID = properties.getProperty('WEEKS_DATABASE_ID');

export const LOGGER_LEVEL = LogLevel.INFO;
export const LOGGER_SHOWN_AFTER_ERROR = 5;

export const DATE_TIMEZONE = 'CET';

export const ARCHIVE_CANCELLED_EVENTS = true;
export const DELETE_CANCELLED_EVENTS = true;
export const UPDATE_CHANGED_EVENTS = false;

export const RELATIVE_MAX_DAY = 15;
export const RELATIVE_MIN_DAY = 0;