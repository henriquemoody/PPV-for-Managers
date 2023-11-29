import type {Config} from 'jest';

class Properties {
    private readonly properties: {[key: string]: string};
    constructor() {
        this.properties = {
            CALENDAR_IDS: '[]',
            DAYS_DATABASE_ID: 'df911a7c-7899-4e19-93c2-666f1273d168',
            NOTION_TOKEN: 'secret_abc',
            DATE_TIMEZONE: 'Europe/Berlin',
            SCHEDULES_DATABASE_ID: '052f2f50-1b85-414e-8d64-4ab387a1fecb',
            TASKS_DATABASE_ID: '047cd64c-7d99-4ebd-929d-019290e8a063',
            UPDATE_CHANGED_EVENTS: 'false',
            WEEKS_DATABASE_ID: 'b376c5c3-da0e-48cf-9ff4-cac4e6e6d73d',
        };
    }
    setProperty(key: string, value: string): this {
        this.properties[key] = value;

        return this;
    }
    getProperty(key: string): string | null {
        return this.properties[key] ?? null;
    }
}

const properties = new Properties();

const config: Config = {
    globals: {
        PropertiesService: {
            getScriptProperties: () => properties,
        },
    },
};

export default config;
