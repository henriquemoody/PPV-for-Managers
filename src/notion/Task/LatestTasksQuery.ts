import {TASKS_DATABASE_ID} from '../../config';

import Query from '../Query';
import TaskMap from './TaskMap';
import {Payload} from '../types';
import {Priority} from '../enums';

export default class LatestTasksQuery implements Query {
    getDatabaseId(): string {
        return TASKS_DATABASE_ID;
    }

    getPayload(): Payload {
        return {
            sorts: [
                {
                    timestamp: 'last_edited_time',
                    direction: 'descending',
                },
            ],
            filter: {
                property: TaskMap.priority,
                select: {
                    equals: Priority.SCHEDULED,
                },
            },
        };
    }
}
