export default interface Query {
    getPayload(): GoogleAppsScript.URL_Fetch.Payload;
    getDatabaseId(): string;
}
