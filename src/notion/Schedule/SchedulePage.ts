import {SCHEDULES_DATABASE_ID} from '../../config';

import DateFormatter from '../../helpers/DateFormatter';
import PropertiesFormatter from '../PropertiesFormatter';
import Page from '../Page';
import PropertiesBuilder from '../PropertiesBuilder';
import QueryResult from '../QueryResult';
import ScheduleMap from './ScheduleMap';
import TaskPage from '../Task/TaskPage';
import {DayOfTheWeek, Frequency, Schedule, Size, Status} from '../enums';

const daysOfWeek = [
    DayOfTheWeek.Sunday,
    DayOfTheWeek.Monday,
    DayOfTheWeek.Tuesday,
    DayOfTheWeek.Wednesday,
    DayOfTheWeek.Thursday,
    DayOfTheWeek.Friday,
    DayOfTheWeek.Saturday,
];

export default class SchedulePage extends Page {
    public readonly priority: string;
    public readonly pillars: Array<string>;
    public readonly projects: Array<string>;
    public readonly practices: Array<string>;
    public readonly schedule: Schedule;
    public readonly size: Size;
    public readonly startOn: Date;
    public readonly interval: number;
    public readonly intervalType: Frequency;
    public readonly daysOfTheWeek: Array<DayOfTheWeek>;

    public constructor(
        title: string,
        priority: string,
        size: Size,
        pillars: string[],
        projects: string[],
        practices: string[],
        startOn: Date,
        interval: number,
        intervalType: Frequency,
        daysOfTheWeek: DayOfTheWeek[]
    ) {
        super(SCHEDULES_DATABASE_ID, title);
        this.priority = priority;
        this.size = size;
        this.pillars = pillars;
        this.projects = projects;
        this.practices = practices;
        this.startOn = startOn;
        this.interval = interval;
        this.intervalType = intervalType;
        this.daysOfTheWeek = daysOfTheWeek;
    }

    static createFromQueryResult(result: QueryResult): SchedulePage {
        const formatter = new PropertiesFormatter(result.properties);

        return new SchedulePage(
            formatter.title(ScheduleMap.title),
            formatter.select(ScheduleMap.priority),
            <Size>formatter.select(ScheduleMap.size),
            formatter.relation(ScheduleMap.pillars),
            formatter.relation(ScheduleMap.projects),
            formatter.relation(ScheduleMap.practices),
            new Date(formatter.dateStart(ScheduleMap.startOn)),
            formatter.number(ScheduleMap.interval),
            <Frequency>formatter.select(ScheduleMap.frequency),
            <Array<DayOfTheWeek>>formatter.multiSelect(ScheduleMap.daysOfTheWeek)
        );
    }

    toTasks(today: Date): Array<TaskPage> {
        const daysOfTheWeek = this.daysOfTheWeek.length > 0 ? this.daysOfTheWeek : [daysOfWeek[today.getDay() - 1]];

        return daysOfTheWeek.map((dayOfTheWeek: DayOfTheWeek) => {
            const task = new TaskPage(
                this.title,
                Status.ACTIVE,
                this.priority,
                this.size,
                true,
                DateFormatter.date(this.getNextDate(today, dayOfTheWeek))
            );

            task.pillars = this.pillars;
            task.projects = this.projects;
            task.practices = this.practices;

            return task;
        });
    }

    private getNextDate(today: Date, dayOfTheWeek: DayOfTheWeek): Date {
        let nextDate = new Date(this.startOn);
        if (nextDate <= today) {
            while (nextDate <= today) {
                if (this.intervalType === Frequency.Daily) {
                    nextDate.setDate(nextDate.getDate() + this.interval);
                    continue;
                }

                if (this.intervalType === Frequency.Monthly) {
                    nextDate.setMonth(nextDate.getMonth() + this.interval);
                    continue;
                }

                nextDate.setDate(nextDate.getDate() + this.interval * 7);
            }
        }

        if (this.intervalType !== Frequency.Weekly) {
            return nextDate;
        }

        nextDate.setDate(nextDate.getDate() - ((nextDate.getDay() + 6) % 7));

        const dayIndex = daysOfWeek.indexOf(dayOfTheWeek);
        const dayDiff = (dayIndex - nextDate.getDay() + 7) % 7;
        if (dayDiff > 0) {
            nextDate.setDate(nextDate.getDate() + dayDiff);
        }

        return nextDate;
    }

    toProperties(): object {
        const builder = new PropertiesBuilder()
            .title(ScheduleMap.title, this.title)
            .select(ScheduleMap.priority, this.priority)
            .select(ScheduleMap.size, this.size)
            .relation(ScheduleMap.pillars, this.pillars)
            .relation(ScheduleMap.projects, this.projects)
            .relation(ScheduleMap.practices, this.practices)
            .select(ScheduleMap.schedule, this.schedule);

        return builder.build();
    }
}
