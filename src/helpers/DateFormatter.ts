import {DATE_TIMEZONE} from '../config';

export default class DateFormatter {
    static date(date: Date): string {
        return Utilities.formatDate(date, DATE_TIMEZONE, 'yyyy-MM-dd');
    }
    static dateTime(date: Date): string {
        return Utilities.formatDate(date, DATE_TIMEZONE, 'yyyy-MM-dd HH:mm:ss');
    }
    static prettyDate(date: Date): string {
        return Utilities.formatDate(date, DATE_TIMEZONE, 'MMMM d, yyyy');
    }
    static prettyWeek(date: Date): string {
        return 'Week ' + Utilities.formatDate(date, DATE_TIMEZONE, 'w');
    }
}
