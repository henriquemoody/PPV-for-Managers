import {DATE_TIMEZONE} from '../config';

const locale = 'en-CA';

export default class DateFormatter {
    static date(date: Date): string {
        return date.toLocaleDateString(locale, {
            timeZone: DATE_TIMEZONE,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });
    }
    static dateTime(date: Date): string {
        return date
            .toLocaleDateString(locale, {
                timeZone: DATE_TIMEZONE,
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            })
            .replace(',', '');
    }
    static prettyDate(date: Date): string {
        return date.toLocaleDateString(locale, {
            timeZone: DATE_TIMEZONE,
            year: 'numeric',
            month: 'long',
            day: '2-digit',
        });
    }
    static prettyWeek(date: Date): string {
        const dateCopy = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        dateCopy.setUTCDate(dateCopy.getUTCDate() + 4 - (dateCopy.getUTCDay() || 7));

        const yearStart = new Date(Date.UTC(dateCopy.getUTCFullYear(), 0, 1));
        const weekNumber = Math.ceil(((dateCopy.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);

        return 'Week ' + weekNumber + ', ' + dateCopy.getUTCFullYear();
    }
    static prettyMonth(date: Date): string {
        return date.toLocaleDateString(locale, {
            timeZone: DATE_TIMEZONE,
            year: 'numeric',
            month: 'long',
        });
    }
}
