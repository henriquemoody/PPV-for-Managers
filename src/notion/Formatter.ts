import DateFormatter from '../helpers/DateFormatter';

export default class Formatter {
    static title(property: {title: any[]}): string | null {
        return Formatter.richTextValue(property.title);
    }

    static dateStart(property: {date: {start: string}}): string | null {
        return Formatter.dateValue(property.date.start);
    }

    static dateEnd(property: {date: {end?: string}}): string | null {
        return Formatter.dateValue(property.date.end);
    }

    static number(property: {number: number | null}): number | null {
        return property.number;
    }

    static select(property: {select: {name: string}}): string {
        return property.select.name;
    }

    static relation(property: {relation: [{id: string}]}): string[] {
        return property.relation.map((relation) => relation.id);
    }

    static richText(property: {rich_text: any[]}): string | null {
        return this.richTextValue(property.rich_text);
    }

    private static richTextValue(richText: any[]): string | null {
        let plainText = '';
        for (let i = 0; i < richText.length; i++) {
            plainText += richText[i].rich_text ? richText[i].rich_text.plain_text : richText[i].plain_text;
        }

        if (plainText.length === 0) {
            return null;
        }

        return plainText;
    }

    private static dateValue(value?: string): string | null {
        if (!value) {
            return null;
        }

        if (value.length === 10) {
            return value;
        }

        return DateFormatter.dateTime(new Date(value));
    }
}
