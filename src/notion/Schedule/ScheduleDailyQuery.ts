import {SCHEDULES_DATABASE_ID} from '../../config';

import Query from '../Query';
import QueryPayload from '../QueryPayload';
import ScheduleMap from './ScheduleMap';
import {Schedule} from '../enums';

export default class ScheduleDailyQuery implements Query {
    private readonly date: Date;

    constructor(date: Date) {
        this.date = date;
    }

    getDatabaseId(): string {
        return SCHEDULES_DATABASE_ID;
    }

    getPayload(): QueryPayload {
        const schedules = [Schedule.Daily];
        if (this.date.getDay() > 0 && this.date.getDay() < 6) {
            schedules.push(Schedule.Weekdays);
        }

        if (this.date.getDay() === 0 || this.date.getDay() === 6) {
            schedules.push(Schedule.Weekend);
        }

        return {
            filter: {
                or: schedules.map((schedule) => {
                    return {
                        property: ScheduleMap.schedule,
                        select: {
                            equals: schedule,
                        },
                    };
                }),
            },
        };
    }
}
