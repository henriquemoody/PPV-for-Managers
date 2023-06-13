import {SCHEDULES_DATABASE_ID} from '../../config';

import Query from '../Query';
import ScheduleMap from './ScheduleMap';
import {Payload} from '../types';
import {Schedule} from '../enums';

export default class ScheduleMonthlyQuery implements Query {
    getDatabaseId(): string {
        return SCHEDULES_DATABASE_ID;
    }

    getPayload(): Payload {
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
