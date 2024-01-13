import {SCHEDULES_DATABASE_ID} from '../../config';

import DateFormatter from '../../helpers/DateFormatter';
import PropertiesFormatter from '../PropertiesFormatter';
import Page from '../Page';
import PropertiesBuilder from '../PropertiesBuilder';
import QueryResult from '../QueryResult';
import ScheduleMap from './ScheduleMap';
import TaskPage from '../Task/TaskPage';
import {Schedule, Size, Status} from '../enums';

export default class SchedulePage extends Page {
    public readonly priority: string;
    public readonly pillars: Array<string>;
    public readonly projects: Array<string>;
    public readonly practices: Array<string>;
    public readonly schedule: Schedule;
    public readonly size: Size;
    public readonly day: number | null;

    private constructor(
        title: string,
        priority: string,
        size: Size,
        pillars: string[],
        projects: string[],
        practices: string[],
        schedule: Schedule,
        day: number | null
    ) {
        super(SCHEDULES_DATABASE_ID, title);
        this.priority = priority;
        this.size = size;
        this.pillars = pillars;
        this.projects = projects;
        this.practices = practices;
        this.schedule = schedule;
        this.day = day;
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
            <Schedule>formatter.select(ScheduleMap.schedule),
            formatter.number(ScheduleMap.day)
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

        const task = new TaskPage(
            this.title,
            null,
            Status.ACTIVE,
            this.priority,
            this.size,
            true,
            DateFormatter.date(date)
        );
        task.pillars = this.pillars;
        task.projects = this.projects;
        task.practices = this.practices;

        return task;
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

        if (this.day !== null) {
            builder.number(ScheduleMap.day, this.day);
        }

        return builder.build();
    }
}
