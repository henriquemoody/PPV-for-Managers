import {PEOPLE_DATABASE_ID} from '../../config';

import QueryPayload from '../QueryPayload';
import CacheableQuery from '../CacheableQuery';

export default class PersonQuery implements CacheableQuery {
    private readonly name: string;
    private readonly email: string;

    constructor(name: string, email: string) {
        this.name = name;
        this.email = email;
    }

    getCacheKey(): string {
        return ['person', this.name, this.email]
            .filter((value) => value !== undefined)
            .map((value) => value.replace(/[^A-Za-z0-9-]+/g, ''))
            .join('-');
    }

    getDatabaseId(): string {
        return PEOPLE_DATABASE_ID;
    }

    getPayload(): QueryPayload {
        const conditions = [
            {
                property: 'Email',
                rich_text: {
                    contains: this.email,
                },
            },
            {
                property: 'Person',
                rich_text: {
                    contains: this.email
                        .split('@')[0]
                        .replace(/[^A-Za-z0-9-]+/g, ' ')
                        .replace(/(^|\s)\S/g, (char) => char.toUpperCase()),
                },
            },
        ];
        if (this.name) {
            conditions.push({
                property: 'Person',
                rich_text: {
                    contains: this.name,
                },
            });
        }

        return {
            filter: {
                or: conditions,
            },
        };
    }
}
