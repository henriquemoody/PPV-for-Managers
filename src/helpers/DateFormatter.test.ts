import DateFormatter from './DateFormatter';

const date = new Date('2023-12-04T12:30:56+01:00');

test('formats a date object into date', () => {
    expect(DateFormatter.date(date)).toBe('2023-12-04');
});

test('formats a date object into datetime', () => {
    expect(DateFormatter.dateTime(date)).toBe('2023-12-04 12:30:56');
});

test('formats a date object into pretty date', () => {
    expect(DateFormatter.prettyDate(date)).toBe('December 4, 2023');
});

test('formats a date object into pretty short date', () => {
    expect(DateFormatter.prettyShortDate(date)).toBe('Dec 4, 2023');
});

test('formats a date object into pretty week', () => {
    expect(DateFormatter.prettyWeek(date)).toBe('Week 49, 2023');
});

test('formats a date object into pretty month', () => {
    expect(DateFormatter.prettyMonth(date)).toBe('December 2023');
});
