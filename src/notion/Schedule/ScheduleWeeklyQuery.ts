import {SCHEDULES_DATABASE_ID} from '../../config';

import Query from '../Query';
import QueryPayload from '../QueryPayload';
import ScheduleMap from './ScheduleMap';
import {Schedule} from '../enums';

export default class ScheduleWeeklyQuery implements Query {
    getDatabaseId(): string {
        return SCHEDULES_DATABASE_ID;
    }

    getPayload(): QueryPayload {
        const schedules = [
            Schedule.Monday,
            Schedule.Tuesday,
            Schedule.Wednesday,
            Schedule.Thursday,
            Schedule.Friday,
            Schedule.Saturday,
            Schedule.Sunday,
        ];

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
