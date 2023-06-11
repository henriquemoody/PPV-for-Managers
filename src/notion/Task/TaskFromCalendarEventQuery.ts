import {TASKS_DATABASE_ID} from '../../config';

import Query from '../Query';
import TaskMap from './TaskMap';
import {Payload} from '../types';

export default class TaskFromCalendarEventQuery implements Query {
    private readonly eventId: string;

    constructor(eventId: string) {
        this.eventId = eventId;
    }

    getDatabaseId(): string {
        return TASKS_DATABASE_ID;
    }

    getPayload(): Payload {
        return {
            filter: {
                property: TaskMap.eventId,
                rich_text: {
                    equals: this.eventId,
                },
            },
        };
    }
}
