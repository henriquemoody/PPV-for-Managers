import {SCHEDULES_DATABASE_ID} from '../../config';

import Query from '../Query';
import QueryPayload from '../QueryPayload';
import ScheduleMap from './ScheduleMap';
import {Schedule} from '../enums';

export default class ScheduleMonthlyQuery implements Query {
    getDatabaseId(): string {
        return SCHEDULES_DATABASE_ID;
    }

    getPayload(): QueryPayload {
        return {
            filter: {
                property: ScheduleMap.schedule,
                select: {
                    equals: Schedule.Monthly,
                },
            },
        };
    }
}
