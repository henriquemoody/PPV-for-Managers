import {HABITS_DATABASE_ID} from '../../config';

import Page from '../Page';
import PropertiesBuilder from '../PropertiesBuilder';
import DayPage from '../Day/DayPage';

export default class HabitsPage extends Page {
    public date: string;
    private day: DayPage;

    private constructor(date: string, day: DayPage) {
        super(HABITS_DATABASE_ID, 'Habits');
        this.date = date;
        this.day = day;
    }

    static createFromDayPage(day: DayPage): HabitsPage {
        return new HabitsPage(day.date, day);
    }

    toProperties(): object {
        return new PropertiesBuilder()
            .title('Name', this.title)
            .relation('Day', [this.day.id])
            .date('Date', this.date)
            .build();
    }
}
