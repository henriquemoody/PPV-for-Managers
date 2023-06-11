import {WEEKS_DATABASE_ID} from '../../config';

import DateFormatter from '../../helpers/DateFormatter';
import Page from '../Page';
import PropertiesBuilder from '../PropertiesBuilder';
import WeekMap from './WeekMap';

export default class WeekPage extends Page {
    public start: string;
    public end: string;

    private constructor(title: string, start: string, end: string) {
        super(WEEKS_DATABASE_ID, title);
        this.start = start;
        this.end = end;
    }

    static createFromDate(date: Date): WeekPage {
        const end = new Date(date);
        end.setDate(end.getDate() + 7);

        return new WeekPage(DateFormatter.prettyWeek(date), DateFormatter.date(date), DateFormatter.date(end));
    }

    toProperties(): object {
        return new PropertiesBuilder()
            .title(WeekMap.title, this.title)
            .date(WeekMap.date, this.start, this.end)
            .build();
    }
}
