import DateFormatter from '../helpers/DateFormatter';

export default class PropertiesFormatter {
    private readonly properties: {[key: string]: any};

    constructor(properties: {[key: string]: any}) {
        this.properties = properties;
    }

    title(property: string): string | null {
        return this.richTextValue(this.properties[property].title);
    }

    dateStart(property: string): string | null {
        return this.dateValue(this.properties[property].date.start);
    }

    dateEnd(property: string): string | null {
        return this.dateValue(this.properties[property].date.end);
    }

    number(property: string): number | null {
        return this.properties[property].number;
    }

    select(property: string): string | null {
        return this.properties[property].select?.name ?? null;
    }

    checkbox(property: string): boolean {
        return this.properties[property].checkbox;
    }

    relation(property: string): string[] {
        return this.properties[property].relation.map((relation) => relation.id);
    }

    richText(property: string): string | null {
        return this.richTextValue(this.properties[property].rich_text);
    }

    private richTextValue(richText: any[]): string | null {
        let plainText = '';
        for (let i = 0; i < richText.length; i++) {
            plainText += richText[i].rich_text ? richText[i].rich_text.plain_text : richText[i].plain_text;
        }

        if (plainText.length === 0) {
            return null;
        }

        return plainText;
    }

    private dateValue(value?: string): string | null {
        if (!value) {
            return null;
        }

        if (value.length === 10) {
            return value;
        }

        return DateFormatter.dateTime(new Date(value));
    }
}
