import {DRY_RUN_MODE, NOTION_TOKEN} from '../config';

import Logger from '../helpers/Logger';
import Page from './Page';
import Query from './Query';
import {Result} from './types';

const DEFAULT_HEADERS: GoogleAppsScript.URL_Fetch.HttpHeaders = {
    Authorization: `Bearer ${NOTION_TOKEN}`,
    Accept: 'application/json',
    'Notion-Version': '2022-06-28',
    'Content-Type': 'application/json',
};

const PAGE_URL = 'https://api.notion.com/v1/pages';

export default class Client {
    private readonly requests: GoogleAppsScript.URL_Fetch.URLFetchRequest[];
    constructor() {
        this.requests = [];
    }

    save(page: Page): void {
        if (page.id) {
            Logger.info('Updating on Notion => %s', page.toString());
            !DRY_RUN_MODE && UrlFetchApp.fetch(PAGE_URL + '/' + page.id, this.buildUpdateRequestOptions(page));
            return;
        }

        Logger.info('Creating on Notion => %s', page.toString());
        !DRY_RUN_MODE && UrlFetchApp.fetch(PAGE_URL, this.buildCreateRequestOptions(page));
    }

    lazySave(page: Page): void {
        if (page.id) {
            Logger.info('Updating on Notion [lazy] => %s', page.toString());
            this.requests.push(this.buildUpdateRequest(page));
            return;
        }

        Logger.info('Creating on Notion [lazy] => %s', page.toString());
        this.requests.push(this.buildCreateRequest(page));
    }

    saveAll(): void {
        if (this.requests.length === 0) {
            Logger.info('Nothing to send to Notion');
            return;
        }

        Logger.info('Sending batch of stacked requests => %s', this.requests.length);
        if (DRY_RUN_MODE) {
            this.requests.length = 0;
            return;
        }

        const responses = UrlFetchApp.fetchAll(this.requests);
        for (let i = 0; i < responses.length; i++) {
            let response = responses[i];
            if (response.getResponseCode() === 200) {
                continue;
            }

            if (response.getResponseCode() === 401) {
                Logger.error('Notion token is invalid');
            } else if (response.getResponseCode() === 404) {
                Logger.error('Notion page not found');
            } else if (response.getResponseCode() === 403) {
                Logger.error('Notion page is private');
            }

            Logger.debug('Request ', JSON.stringify(this.requests[i]));

            this.requests.length = 0;
            throw new Error(response.getContentText());
        }

        this.requests.length = 0;
    }

    query(query: Query): Result[] {
        return this.fetch(`https://api.notion.com/v1/databases/${query.getDatabaseId()}/query`, query.getPayload())[
            'results'
        ];
    }

    queryOne(query: Query): Result | null {
        const results = this.fetch(
            `https://api.notion.com/v1/databases/${query.getDatabaseId()}/query`,
            query.getPayload()
        )['results'];

        if (results.length === 0) {
            return null;
        }

        if (results.length > 1) {
            Logger.warn('Found multiple entries => Considering index zero entry', query.getPayload());
        }

        return results[0];
    }

    private fetch(url: string, payload: GoogleAppsScript.URL_Fetch.Payload): object {
        // UrlFetchApp is sync even if async is specified
        let options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
            method: 'post',
            headers: DEFAULT_HEADERS,
            muteHttpExceptions: true,
            payload: JSON.stringify(payload),
        };

        const response = UrlFetchApp.fetch(url, options);

        Logger.debug('Request options', options);

        if (response.getResponseCode() === 200) {
            const responseContent = JSON.parse(response.getContentText());
            if (responseContent.length == 0) {
                throw new Error('No data returned from Notion API. Check your Notion token.');
            }
            return responseContent;
        }

        if (response.getResponseCode() === 401) {
            throw new Error('Notion token is invalid.');
        }

        throw new Error(response.getContentText());
    }

    private buildCreateRequest(page: Page): GoogleAppsScript.URL_Fetch.URLFetchRequest {
        return {url: PAGE_URL, ...this.buildCreateRequestOptions(page)};
    }

    private buildCreateRequestOptions(page: Page): GoogleAppsScript.URL_Fetch.URLFetchRequestOptions {
        return {
            method: 'post',
            headers: DEFAULT_HEADERS,
            muteHttpExceptions: true,
            payload: JSON.stringify({
                parent: {
                    type: 'database_id',
                    database_id: page.databaseId,
                },
                properties: page.toProperties(),
            }),
        };
    }

    private buildUpdateRequest(page: Page): GoogleAppsScript.URL_Fetch.URLFetchRequest {
        return {
            url: PAGE_URL + '/' + page.id,
            ...this.buildUpdateRequestOptions(page),
        };
    }

    private buildUpdateRequestOptions(page: Page): GoogleAppsScript.URL_Fetch.URLFetchRequestOptions {
        return {
            method: 'patch',
            headers: DEFAULT_HEADERS,
            muteHttpExceptions: true,
            payload: JSON.stringify({
                properties: page.toProperties(),
                archived: page.isArchived(),
            }),
        };
    }
}
