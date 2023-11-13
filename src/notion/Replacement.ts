import Page from './Page';

export default class Replacement {
    public readonly placeholder: string;
    public readonly page: Page;

    constructor(search: string, replace: Page) {
        this.placeholder = search;
        this.page = replace;
    }
}
