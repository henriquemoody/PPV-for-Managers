export default abstract class Page {
    private readonly _databaseId: string;
    public id?: string;
    public title: string;

    protected constructor(databaseId: string, title: string) {
        this._databaseId = databaseId;
        this.title = title;
    }

    isArchived(): boolean {
        return false;
    }

    get databaseId(): string {
        return this._databaseId;
    }

    get iconUrl(): string | null {
        return null;
    }

    toString(): string {
        if (this.isArchived()) {
            return Utilities.formatString('%s (archived %s)', this.title, this.constructor.name);
        }

        return Utilities.formatString('%s (%s)', this.title, this.constructor.name);
    }

    abstract toProperties(): object;
}
