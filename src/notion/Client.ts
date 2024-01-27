import {DRY_RUN_MODE, NOTION_TOKEN} from '../config';

import Logger from '../helpers/Logger';
import Page from './Page';
import Query from './Query';
import QueryResult from './QueryResult';
import CacheableQuery from './CacheableQuery';

const DEFAULT_HEADERS: GoogleAppsScript.URL_Fetch.HttpHeaders = {
    Authorization: `Bearer ${NOTION_TOKEN}`,
    Accept: 'application/json',
    'Notion-Version': '2022-06-28',
    'Content-Type': 'application/json',
};

const PAGE_URL = 'https://api.notion.com/v1/pages';
const cache = CacheService.getScriptCache();

interface Payload {
    properties: object;
    icon?: object;
}

interface CreatePayload extends Payload {
    parent: object;
}

interface UpdatePayload extends Payload {
    archived: boolean;
}

export default class Client {
    private readonly requests: {page: Page; request: GoogleAppsScript.URL_Fetch.URLFetchRequest}[];
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
        if (DRY_RUN_MODE) {
            return;
        }
        const pageId = this.getIdFromResponse(UrlFetchApp.fetch(PAGE_URL, this.buildCreateRequestOptions(page)));

        Logger.debug('Updating page ID => %s # %s', page.toString(), pageId);
        page.id = pageId;
    }

    lazySave(page: Page): void {
        if (page.id) {
            Logger.info('Updating on Notion [lazy] => %s', page.toString());
            this.requests.push({page, request: this.buildUpdateRequest(page)});
            return;
        }

        Logger.info('Creating on Notion [lazy] => %s', page.toString());
        this.requests.push({page, request: this.buildCreateRequest(page)});
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

        const responses = UrlFetchApp.fetchAll(this.requests.map((request) => request.request));
        for (let i = 0; i < responses.length; i++) {
            const page = this.requests[i].page;
            const pageId = this.getIdFromResponse(responses[i]);

            Logger.debug('Updating page ID => %s # %s', page.toString(), pageId);
            page.id = pageId;
        }

        this.requests.length = 0;
    }

    query(query: Query): QueryResult[] {
        return this.fetch(`https://api.notion.com/v1/databases/${query.getDatabaseId()}/query`, query.getPayload())[
            'results'
        ];
    }

    queryOne(query: Query): QueryResult | null {
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

    cacheableQueryOne(query: CacheableQuery): QueryResult | null {
        const key = query.getCacheKey();
        const cached = cache.get(key);
        if (cached !== null) {
            Logger.debug('Found data in cache', key, cached);
            return JSON.parse(cached);
        }

        const result = this.queryOne(query);
        if (result !== null) {
            Logger.debug('Saving data in cache', key, result);
            cache.put(key, JSON.stringify(result));
        } else {
            Logger.debug('Saving empty data in cache for 5 minutes', key, result);
            cache.put(key, JSON.stringify(result), 60 * 5);
        }

        return result;
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
        const payload: CreatePayload = {
            parent: {
                type: 'database_id',
                database_id: page.databaseId,
            },
            properties: page.toProperties(),
        };
        if (page.iconUrl !== null) {
            payload.icon = {type: 'external', external: {url: page.iconUrl}};
        }

        return {
            method: 'post',
            headers: DEFAULT_HEADERS,
            muteHttpExceptions: true,
            payload: JSON.stringify(payload),
        };
    }

    private buildUpdateRequest(page: Page): GoogleAppsScript.URL_Fetch.URLFetchRequest {
        return {
            url: PAGE_URL + '/' + page.id,
            ...this.buildUpdateRequestOptions(page),
        };
    }

    private buildUpdateRequestOptions(page: Page): GoogleAppsScript.URL_Fetch.URLFetchRequestOptions {
        const payload: UpdatePayload = {
            properties: page.toProperties(),
            archived: page.isArchived(),
        };
        if (page.iconUrl !== null) {
            payload.icon = {type: 'external', external: {url: page.iconUrl}};
        }

        return {
            method: 'patch',
            headers: DEFAULT_HEADERS,
            muteHttpExceptions: true,
            payload: JSON.stringify(payload),
        };
    }

    private getIdFromResponse(response: GoogleAppsScript.URL_Fetch.HTTPResponse): string {
        if (response.getResponseCode() !== 200) {
            throw new Error(response.getContentText());
        }

        const content = JSON.parse(response.getContentText());

        return content.id;
    }
}
