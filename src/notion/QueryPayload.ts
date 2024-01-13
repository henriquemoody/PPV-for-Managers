export type QueryPayload = {
    sorts?: object[];
    filter: {[key: string]: any};
};

export default QueryPayload;
