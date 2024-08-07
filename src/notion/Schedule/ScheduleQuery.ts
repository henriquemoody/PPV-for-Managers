import {SCHEDULES_DATABASE_ID} from '../../config';

import Query from '../Query';
import QueryPayload from '../QueryPayload';
import ScheduleMap from './ScheduleMap';
import {Frequency} from '../enums';
import DateFormatter from '../../helpers/DateFormatter';

export default class ScheduleQuery implements Query {
    private readonly date: Date;
    private readonly frequency: Frequency;

    constructor(date: Date, frequency: Frequency) {
        this.date = date;
        this.frequency = frequency;
    }
    getDatabaseId(): string {
        return SCHEDULES_DATABASE_ID;
    }

    getPayload(): QueryPayload {
        return {
            filter: {
                and: [
                    {
                        property: ScheduleMap.frequency,
                        select: {
                            equals: this.frequency,
                        },
                    },
                    {
                        property: ScheduleMap.startOn,
                        date: {
                            on_or_before: DateFormatter.date(this.date),
                        },
                    },
                ],
            },
        };
    }
}
