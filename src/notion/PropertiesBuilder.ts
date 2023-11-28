import Replacement from './Replacement';

export default class PropertiesBuilder {
    private readonly properties: object;

    constructor() {
        this.properties = {};
    }

    title(property: string, content: string, replacement?: Replacement): this {
        if (!replacement || !replacement.page.id || content.indexOf(replacement.placeholder) === -1) {
            this.properties[property] = {
                type: 'title',
                title: [this.text(content)],
            };

            return this;
        }

        const title = [];
        const contentParts = content.split('#');
        for (const contentPart of contentParts) {
            if (contentPart !== replacement.placeholder) {
                title.push(this.text(contentPart));
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
            rich_text: [this.text(content)],
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

    checkbox(property: string, value: boolean): this {
        this.properties[property] = {
            type: 'checkbox',
            checkbox: value,
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

    private text(content: string): object {
        return {
            type: 'text',
            text: {
                content,
            },
        };
    }

    build(): object {
        return this.properties;
    }
}
