export type QueryResult = {
    id: string;
    last_edited_time: string;
    properties: {[key: string]: object[]}[];
};

export default QueryResult;
