import {SCHEDULES_DATABASE_ID} from '../../config';

import DateFormatter from '../../helpers/DateFormatter';
import Formatter from '../Formatter';
import Page from '../Page';
import PropertiesBuilder from '../PropertiesBuilder';
import ScheduleMap from './ScheduleMap';
import TaskPage from '../Task/TaskPage';
import {Result} from '../types';
import {Schedule, Size, Status} from '../enums';

export default class SchedulePage extends Page {
    public readonly priority: string;
    public readonly pillars: Array<string>;
    public readonly projects: Array<string>;
    public readonly schedule: Schedule;
    public readonly size: Size;
    public readonly day: number | null;

    private constructor(
        title: string,
        priority: string,
        size: Size,
        pillars: string[],
        projects: string[],
        schedule: Schedule,
        day: number | null
    ) {
        super(SCHEDULES_DATABASE_ID, title);
        this.priority = priority;
        this.size = size;
        this.pillars = pillars;
        this.projects = projects;
        this.schedule = schedule;
        this.day = day;
    }

    static createFromResult(result: Result): SchedulePage {
        return new SchedulePage(
            Formatter.title(result.properties[ScheduleMap.title]),
            Formatter.select(result.properties[ScheduleMap.priority]),
            <Size>Formatter.select(result.properties[ScheduleMap.size]),
            Formatter.relation(result.properties[ScheduleMap.pillars]),
            Formatter.relation(result.properties[ScheduleMap.projects]),
            <Schedule>Formatter.select(result.properties[ScheduleMap.schedule]),
            Formatter.number(result.properties[ScheduleMap.day])
        );
    }

    toTask(): TaskPage {
        const date = new Date();
        const daysOfWeek = {
            [Schedule.Monday]: 1,
            [Schedule.Tuesday]: 2,
            [Schedule.Wednesday]: 3,
            [Schedule.Thursday]: 4,
            [Schedule.Friday]: 5,
            [Schedule.Saturday]: 6,
            [Schedule.Sunday]: 7,
        };
        if (this.day !== null) {
            date.setDate(this.day);
        } else if (this.schedule in daysOfWeek) {
            date.setDate(date.getDate() + ((daysOfWeek[this.schedule] + 7 - date.getDay()) % 7));
        }

        const task = new TaskPage(this.title, null, Status.ACTIVE, this.priority, this.size, DateFormatter.date(date));
        task.pillars = this.pillars;
        task.projects = this.projects;

        return task;
    }

    toProperties(): object {
        const builder = new PropertiesBuilder();

        builder.title(ScheduleMap.title, this.title);
        builder.select(ScheduleMap.priority, this.priority);
        builder.select(ScheduleMap.size, this.size);
        builder.relation(ScheduleMap.pillars, this.pillars);
        builder.relation(ScheduleMap.projects, this.projects);
        builder.select(ScheduleMap.schedule, this.schedule);

        if (this.day !== null) {
            builder.number(ScheduleMap.day, this.day);
        }

        return builder.build();
    }
}
