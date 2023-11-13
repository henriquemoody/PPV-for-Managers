import Replacement from './Replacement';

export default class PropertiesBuilder {
    private readonly properties: object;

    constructor() {
        this.properties = {};
    }

    title(property: string, content: string, replacement?: Replacement): this {
        if (!replacement) {
            this.properties[property] = {
                type: 'title',
                title: [
                    {
                        type: 'text',
                        text: {
                            content: content,
                        },
                    },
                ],
            };

            return this;
        }

        const title = [];
        const contentParts = content.split('#');
        for (const contentPart of contentParts) {
            if (contentPart !== replacement.placeholder || !replacement.page.id) {
                title.push({
                    type: 'text',
                    text: {
                        content: contentPart,
                    },
                });
                continue;
            }

            title.push({
                type: 'mention',
                mention: {
                    type: 'page',
                    page: {
                        id: replacement.page.id,
                    },
                },
                plain_text: replacement.page.title,
                href: 'https://www.notion.so/' + replacement.page.id.replace(/-/g, ''),
            });
        }

        this.properties[property] = {
            type: 'title',
            title: title,
        };

        return this;
    }

    richText(property: string, content: string): this {
        this.properties[property] = {
            type: 'rich_text',
            rich_text: [
                {
                    text: {
                        content: content,
                    },
                },
            ],
        };

        return this;
    }

    date(property: string, start: string, end?: string): this {
        this.properties[property] = {
            type: 'date',
            date: {
                start: start,
                ...(start.length > 10 ? {time_zone: 'Europe/Berlin'} : {}),
                ...(end ? {end: end} : {}),
            },
        };

        return this;
    }

    select(property: string, name: string): this {
        this.properties[property] = {
            select: {
                name: name,
            },
        };

        return this;
    }

    relation(property: string, relations: Array<string>): this {
        if (relations.length > 0) {
            this.properties[property] = {
                relation: relations.map((relation) => {
                    return {
                        id: relation,
                    };
                }),
            };
        }

        return this;
    }

    number(property: string, number: number): this {
        this.properties[property] = {
            number: number,
        };

        return this;
    }

    build(): object {
        return this.properties;
    }
}
