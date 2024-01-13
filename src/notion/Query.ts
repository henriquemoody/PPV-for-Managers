import QueryPayload from './QueryPayload';

export default interface Query {
    getPayload(): QueryPayload;
    getDatabaseId(): string;
}
