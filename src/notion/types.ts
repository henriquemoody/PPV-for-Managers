export type Result = {
    id: string;
    last_edited_time: string;
    properties: {[key: string]: object[]}[];
};

export type Payload = {
    sorts?: object[];
    filter: {[key: string]: any};
};
