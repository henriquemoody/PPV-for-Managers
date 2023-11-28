import PropertiesFormatter from './PropertiesFormatter';

const PROPERTY_NAME = 'property_name';

test('formats a title', () => {
    const title = 'This is a title';
    const sut = new PropertiesFormatter({
        [PROPERTY_NAME]: {
            title: [
                {
                    plain_text: title,
                },
            ],
        },
    });
    expect(sut.title(PROPERTY_NAME)).toBe(title);
});

test('formats a checkbox when it is false', () => {
    const sut = new PropertiesFormatter({
        [PROPERTY_NAME]: {
            type: 'checkbox',
            checkbox: false,
        },
    });
    expect(sut.checkbox(PROPERTY_NAME)).toBeFalsy();
});

test('formats a checkbox when it is true', () => {
    const sut = new PropertiesFormatter({
        [PROPERTY_NAME]: {
            type: 'checkbox',
            checkbox: true,
        },
    });
    expect(sut.checkbox(PROPERTY_NAME)).toBeTruthy();
});

test('formats a date start when it is null', () => {
    const sut = new PropertiesFormatter({
        [PROPERTY_NAME]: {
            date: {
                start: null,
            },
        },
    });
    expect(sut.dateStart(PROPERTY_NAME)).toBeNull();
});

test('formats a date start when it is a date', () => {
    const expected = '2021-05-17';
    const sut = new PropertiesFormatter({
        [PROPERTY_NAME]: {
            date: {
                start: expected,
            },
        },
    });
    expect(sut.dateStart(PROPERTY_NAME)).toBe(expected);
});

test('formats a date start when it is a date and time', () => {
    const start = '2023-11-29T13:30:56+01:00';
    const expected = '2023-11-29 13:30:56';
    const sut = new PropertiesFormatter({
        [PROPERTY_NAME]: {
            date: {
                start: start,
            },
        },
    });
    expect(sut.dateStart(PROPERTY_NAME)).toBe(expected);
});

test('formats a date end when it is null', () => {
    const sut = new PropertiesFormatter({
        [PROPERTY_NAME]: {
            date: {
                end: null,
            },
        },
    });
    expect(sut.dateEnd(PROPERTY_NAME)).toBeNull();
});

test('formats a date end when it is a date', () => {
    const expected = '2021-05-17';
    const sut = new PropertiesFormatter({
        [PROPERTY_NAME]: {
            date: {
                end: expected,
            },
        },
    });
    expect(sut.dateEnd(PROPERTY_NAME)).toBe(expected);
});

test('formats a date end when it is a date and time', () => {
    const end = '2023-11-29T13:30:56+01:00';
    const expected = '2023-11-29 13:30:56';
    const sut = new PropertiesFormatter({
        [PROPERTY_NAME]: {
            date: {
                end: end,
            },
        },
    });
    expect(sut.dateEnd(PROPERTY_NAME)).toBe(expected);
});

test('formats a number', () => {
    const expected = 43;
    const sut = new PropertiesFormatter({
        [PROPERTY_NAME]: {
            number: expected,
        },
    });
    expect(sut.number(PROPERTY_NAME)).toBe(expected);
});

test('formats a select when it has a value', () => {
    const expected = 'My select';
    const sut = new PropertiesFormatter({
        [PROPERTY_NAME]: {
            select: {
                name: expected,
            },
        },
    });
    expect(sut.select(PROPERTY_NAME)).toBe(expected);
});

test('formats a relation', () => {
    const expected = ['bd198148-62fe-4d4b-b0a1-b4328a4406b1', 'd73f5032-f80a-4795-9432-3fc85a5880a4'];
    const sut = new PropertiesFormatter({
        [PROPERTY_NAME]: {
            relation: [
                {
                    id: expected[0],
                },

                {
                    id: expected[1],
                },
            ],
        },
    });
    expect(sut.relation(PROPERTY_NAME)).toStrictEqual(expected);
});

test('formats a relation when it has no value', () => {
    const sut = new PropertiesFormatter({
        [PROPERTY_NAME]: {
            relation: [],
        },
    });
    expect(sut.relation(PROPERTY_NAME)).toStrictEqual([]);
});

test('formats rich text', () => {
    const sut = new PropertiesFormatter({
        [PROPERTY_NAME]: {
            rich_text: [
                {
                    plain_text: 'My',
                },
                {
                    rich_text: {
                        plain_text: ' rich',
                    },
                },
                {
                    plain_text: ' text',
                },
            ],
        },
    });
    expect(sut.richText(PROPERTY_NAME)).toBe('My rich text');
});
