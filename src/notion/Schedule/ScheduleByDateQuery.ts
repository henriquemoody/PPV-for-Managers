import {SCHEDULES_DATABASE_ID} from '../../config';

import Query from '../Query';
import ScheduleMap from './ScheduleMap';
import {Payload} from '../types';
import {Schedule} from '../enums';

export default class ScheduleByDateQuery implements Query {
    private readonly date: Date;

    constructor(date: Date) {
        this.date = date;
    }

    getDatabaseId(): string {
        return SCHEDULES_DATABASE_ID;
    }

    getPayload(): Payload {
        const schedules = [Schedule.Daily];
        if (this.date.getDay() === 1) {
            schedules.push(
                Schedule.Monday,
                Schedule.Tuesday,
                Schedule.Wednesday,
                Schedule.Thursday,
                Schedule.Friday,
                Schedule.Saturday,
                Schedule.Sunday
            );
        }

        if (this.date.getDate() === 1) {
            schedules.push(Schedule.Monthly);
        }

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
