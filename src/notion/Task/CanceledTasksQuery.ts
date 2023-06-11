import {TASKS_DATABASE_ID} from '../../config';

import Query from '../Query';
import TaskMap from './TaskMap';
import {Priority, Status} from '../enums';

export default class CanceledTasksQuery implements Query {
    getDatabaseId(): string {
        return TASKS_DATABASE_ID;
    }

    getPayload(): GoogleAppsScript.URL_Fetch.Payload {
        return {
            filter: {
                and: [
                    {
                        property: TaskMap.status,
                        select: {
                            equals: Status.CANCELED,
                        },
                    },
                    {
                        property: TaskMap.priority,
                        select: {
                            equals: Priority.SCHEDULED,
                        },
                    },
                ],
            },
        };
    }
}
