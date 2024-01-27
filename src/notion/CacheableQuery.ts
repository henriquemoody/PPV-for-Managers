import Query from './Query';

export default interface CacheableQuery extends Query {
    getCacheKey(): string;
}
