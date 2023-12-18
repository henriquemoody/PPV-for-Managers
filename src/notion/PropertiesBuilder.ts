import Replacement from './Replacement';

export default class PropertiesBuilder {
    private readonly properties: object;

    constructor() {
        this.properties = {};
    }

    title(property: string, content: string, replacement?: Replacement): this {
        this.properties[property] = {
            type: 'title',
            title: this.toRichText(content, replacement),
        };

        return this;
    }

    richText(property: string, content: string): this {
        this.properties[property] = {
            type: 'rich_text',
            rich_text: [this.toText(content)],
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

    private toRichText(content: string, replacement?: Replacement): Array<object> {
        if (!content) {
            return [];
        }

        const placeholderPattern = /^(.*)#([A-Za-z]+)(.*)$/;
        const placeholder = content.match(placeholderPattern);
        if (replacement && replacement.page.id && placeholder && placeholder[2] === replacement.placeholder) {
            return [
                ...this.toRichText(placeholder[1]),
                this.toMention(replacement.page.title, replacement.page.id),
                ...this.toRichText(placeholder[3]),
            ];
        }

        const mentionPattern = /^(.*)@\[([^\]]+)\]\(([^\)]+)\)(.*)$/;
        const mention = content.match(mentionPattern);
        if (mention) {
            return [
                ...this.toRichText(mention[1]),
                this.toMention(mention[2], mention[3]),
                ...this.toRichText(mention[4]),
            ];
        }

        const linkPattern = /^(.*)\[([^\]]+)\]\(([^\)]+)\)(.*)$/;
        const link = content.match(linkPattern);
        if (link) {
            return [...this.toRichText(link[1]), this.toLink(link[2], link[3]), ...this.toRichText(link[4])];
        }

        return [this.toText(content)];
    }

    private toText(content: string): object {
        if (content.length === 0) {
            return;
        }

        return {
            type: 'text',
            text: {
                content,
            },
        };
    }

    private toMention(text: string, id: string): object {
        return {
            type: 'mention',
            mention: {
                type: 'page',
                page: {
                    id: id,
                },
            },
            plain_text: text,
            href: 'https://www.notion.so/' + id.replace(/-/g, ''),
        };
    }

    private toLink(text: string, url: string): object {
        return {
            type: 'text',
            text: {
                content: text,
                link: {
                    url: url,
                },
            },
            plain_text: text,
            href: url,
        };
    }

    build(): object {
        return this.properties;
    }
}
