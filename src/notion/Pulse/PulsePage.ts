import {PULSE_DATABASE_ID} from '../../config';

import Page from '../Page';
import PropertiesBuilder from '../PropertiesBuilder';
import DayPage from '../Day/DayPage';

export default class PulsePage extends Page {
    public date: string;
    private day: DayPage;

    private constructor(date: string, day: DayPage) {
        super(PULSE_DATABASE_ID, 'Pulse');
        this.date = date;
        this.day = day;
    }

    static createFromDayPage(day: DayPage): PulsePage {
        return new PulsePage(day.date, day);
    }

    toProperties(): object {
        return new PropertiesBuilder()
            .title('Name', this.title)
            .relation('Day', [this.day.id])
            .date('Date', this.date)
            .build();
    }
}
