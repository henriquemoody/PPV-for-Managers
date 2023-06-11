import {DAYS_DATABASE_ID} from '../../config';

import DateFormatter from '../../helpers/DateFormatter';
import DayMap from './DayMap';
import Page from '../Page';
import PropertiesBuilder from '../PropertiesBuilder';

export default class DayPage extends Page {
    public start: string;

    private constructor(title: string, start: string) {
        super(DAYS_DATABASE_ID, title);
        this.start = start;
    }

    static createFromDate(date: Date): DayPage {
        return new DayPage(DateFormatter.prettyDate(date), DateFormatter.date(date));
    }

    toProperties(): object {
        return new PropertiesBuilder().title(DayMap.title, this.title).date(DayMap.date, this.start).build();
    }
}
