import SchedulePage from './SchedulePage';
import {DayOfTheWeek, Frequency, Size} from '../enums';

describe.each([
    {frequency: Frequency.Daily, interval: 1, daysOfTheWeek: [], expected: ['2024-08-05']},
    {frequency: Frequency.Daily, interval: 2, daysOfTheWeek: [], expected: ['2024-08-05']},
    {frequency: Frequency.Daily, interval: 3, daysOfTheWeek: [], expected: ['2024-08-07']},
    {frequency: Frequency.Monthly, interval: 1, daysOfTheWeek: [], expected: ['2024-09-01']},
    {frequency: Frequency.Monthly, interval: 2, daysOfTheWeek: [], expected: ['2024-10-01']},
    {frequency: Frequency.Monthly, interval: 3, daysOfTheWeek: [], expected: ['2024-11-01']},
    {frequency: Frequency.Weekly, interval: 1, daysOfTheWeek: [DayOfTheWeek.Monday], expected: ['2024-08-05']},
    {frequency: Frequency.Weekly, interval: 1, daysOfTheWeek: [DayOfTheWeek.Tuesday], expected: ['2024-08-06']},
    {frequency: Frequency.Weekly, interval: 1, daysOfTheWeek: [DayOfTheWeek.Wednesday], expected: ['2024-08-07']},
    {frequency: Frequency.Weekly, interval: 1, daysOfTheWeek: [DayOfTheWeek.Thursday], expected: ['2024-08-08']},
    {frequency: Frequency.Weekly, interval: 1, daysOfTheWeek: [DayOfTheWeek.Friday], expected: ['2024-08-09']},
    {frequency: Frequency.Weekly, interval: 1, daysOfTheWeek: [DayOfTheWeek.Saturday], expected: ['2024-08-10']},
    {frequency: Frequency.Weekly, interval: 1, daysOfTheWeek: [DayOfTheWeek.Sunday], expected: ['2024-08-11']},
    {frequency: Frequency.Weekly, interval: 2, daysOfTheWeek: [DayOfTheWeek.Monday], expected: ['2024-08-12']},
    {frequency: Frequency.Weekly, interval: 2, daysOfTheWeek: [DayOfTheWeek.Tuesday], expected: ['2024-08-13']},
    {frequency: Frequency.Weekly, interval: 2, daysOfTheWeek: [DayOfTheWeek.Wednesday], expected: ['2024-08-14']},
    {frequency: Frequency.Weekly, interval: 2, daysOfTheWeek: [DayOfTheWeek.Thursday], expected: ['2024-08-15']},
    {frequency: Frequency.Weekly, interval: 2, daysOfTheWeek: [DayOfTheWeek.Friday], expected: ['2024-08-16']},
    {frequency: Frequency.Weekly, interval: 2, daysOfTheWeek: [DayOfTheWeek.Saturday], expected: ['2024-08-17']},
    {frequency: Frequency.Weekly, interval: 2, daysOfTheWeek: [DayOfTheWeek.Sunday], expected: ['2024-08-18']},
    {
        frequency: Frequency.Weekly,
        interval: 1,
        daysOfTheWeek: [DayOfTheWeek.Tuesday, DayOfTheWeek.Thursday, DayOfTheWeek.Sunday],
        expected: ['2024-08-06', '2024-08-08', '2024-08-11'],
    },
])(`create task from a schedule`, (data) => {
    const today = new Date('2024-08-05T00:00:00+01:00');
    const startOn = new Date('2024-08-01');

    it(`Frequency: ${data.frequency} | Interval: ${data.interval} | Days of the Week: ${data.daysOfTheWeek}`, () => {
        const schedulePage = new SchedulePage(
            'Title',
            '1st',
            Size.MEDIUM,
            [],
            [],
            [],
            startOn,
            data.interval,
            data.frequency,
            data.daysOfTheWeek
        );

        expect(schedulePage.toTasks(today).map((task) => task.start)).toMatchObject(data.expected);
    });
});
