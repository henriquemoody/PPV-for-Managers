const properties = PropertiesService.getScriptProperties();

export enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3,
}

function propertyValue(property: string, defaultValue?: any): any {
    const value = properties.getProperty(property);

    if (value === null) {
        return defaultValue;
    }

    return value;
}

function propertyDecode(property: string, defaultValue: any): any {
    return JSON.parse(propertyValue(property, defaultValue));
}

export const NOTION_TOKEN: string = propertyValue('NOTION_TOKEN');

export const CALENDAR_IDS: Record<string, string> = propertyDecode('CALENDAR_IDS', '[]') as Record<string, string>;
export const CALENDAR_IGNORE_REGEXP: RegExp = new RegExp(propertyValue('CALENDAR_IGNORE_REGEXP', '/^$/'));

export const DAYS_DATABASE_ID: string = <string>propertyValue('DAYS_DATABASE_ID');
export const SCHEDULES_DATABASE_ID: string = <string>propertyValue('SCHEDULES_DATABASE_ID');
export const TASKS_DATABASE_ID: string = <string>propertyValue('TASKS_DATABASE_ID');
export const WEEKS_DATABASE_ID: string = <string>propertyValue('WEEKS_DATABASE_ID');
export const HABITS_DATABASE_ID: string = <string>propertyValue('HABITS_DATABASE_ID');
export const PULSE_DATABASE_ID: string = <string>propertyValue('PULSE_DATABASE_ID');
export const MONTHS_DATABASE_ID: string = <string>propertyValue('MONTHS_DATABASE_ID');
export const PEOPLE_DATABASE_ID: string = <string>propertyValue('PEOPLE_DATABASE_ID');

export const LOGGER_LEVEL: LogLevel = <LogLevel>propertyDecode('LOGGER_LEVEL', LogLevel.INFO);
export const LOGGER_SHOWN_AFTER_ERROR: number = <number>propertyDecode('LOGGER_SHOWN_AFTER_ERROR', 5);

export const DATE_TIMEZONE: string = <string>propertyValue('DATE_TIMEZONE', 'CET');

export const DRY_RUN_MODE: boolean = <boolean>propertyDecode('DRY_RUN_MODE', false);

export const ARCHIVE_CANCELLED_EVENTS: boolean = <boolean>propertyValue('ARCHIVE_CANCELLED_EVENTS', true);

export const RELATIVE_MAX_DAY: number = <number>propertyValue('RELATIVE_MAX_DAY', 15);
export const RELATIVE_MIN_DAY: number = <number>propertyValue('RELATIVE_MIN_DAY', 0);
