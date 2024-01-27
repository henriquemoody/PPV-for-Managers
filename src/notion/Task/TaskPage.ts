import {TASKS_DATABASE_ID, CALENDAR_IDS} from '../../config';

import DateFormatter from '../../helpers/DateFormatter';
import PropertiesFormatter from '../PropertiesFormatter';
import Page from '../Page';
import PropertiesBuilder from '../PropertiesBuilder';
import QueryResult from '../QueryResult';
import TaskMap from './TaskMap';
import {Size, Status} from '../enums';
import Replacement from '../Replacement';

export default class TaskPage extends Page {
    public eventId?: string;
    public start: string;
    public end?: string;
    public status: Status;
    public priority: string;
    public size: Size;
    public calendar?: string;
    public pillars: Array<string>;
    public projects: Array<string>;
    public practices: Array<string>;
    public people: Array<string>;
    public lastSyncTime?: Date;
    public lastEditedTime: Date;
    public replacement?: Replacement;
    public isRecurring: boolean;

    constructor(
        title: string,
        status: Status,
        priority: string,
        size: Size,
        isRecurring: boolean,
        start,
        end?,
        eventId?,
        calendar?,
        people: Array<string> = []
    ) {
        super(TASKS_DATABASE_ID, title);
        this.start = start;
        this.end = end;
        this.status = status;
        this.priority = priority;
        this.size = size;
        this.isRecurring = isRecurring;
        this.eventId = eventId;
        this.calendar = calendar;
        this.pillars = [];
        this.projects = [];
        this.practices = [];
        this.people = people;
    }

    static createFromQueryResult(result: QueryResult): TaskPage {
        const formatter = new PropertiesFormatter(result.properties);
        const taskPage = new TaskPage(
            formatter.title(TaskMap.title),
            <Status>formatter.select(TaskMap.status),
            formatter.select(TaskMap.priority),
            <Size>formatter.select(TaskMap.size),
            formatter.checkbox(TaskMap.recurring),
            formatter.dateStart(TaskMap.date),
            formatter.dateEnd(TaskMap.date),
            formatter.richText(TaskMap.eventId),
            formatter.select(TaskMap.calendar),
            formatter.relation(TaskMap.people)
        );
        taskPage.id = result.id;
        taskPage.lastSyncTime = new Date(formatter.dateStart(TaskMap.lastSyncTime));
        taskPage.lastEditedTime = new Date(result.last_edited_time);
        taskPage.pillars = formatter.relation(TaskMap.pillars);
        taskPage.projects = formatter.relation(TaskMap.projects);
        taskPage.practices = formatter.relation(TaskMap.practices);

        return taskPage;
    }

    get calendarId(): string {
        return CALENDAR_IDS[this.calendar];
    }

    merge(task: TaskPage): void {
        this.id = task.id;
        this.pillars = task.pillars || [];
        this.projects = task.projects || [];
        this.practices = task.practices || [];
        this.lastSyncTime = task.lastSyncTime;
        this.lastEditedTime = task.lastEditedTime;
    }

    isArchived(): boolean {
        return this.status === Status.CANCELED;
    }

    isSynchronizable(): boolean {
        return CALENDAR_IDS.hasOwnProperty(this.calendar) && this.start.length >= 10;
    }

    isUpToDate(task: TaskPage): boolean {
        return JSON.stringify(this) === JSON.stringify(task);
    }

    addReplacement(placeholder: string, page: Page): this {
        this.replacement = new Replacement(placeholder, page);

        return this;
    }

    toProperties(): object {
        const builder = new PropertiesBuilder()
            .title(TaskMap.title, this.title, this.replacement)
            .date(TaskMap.date, this.start, this.end)
            .select(TaskMap.priority, this.priority)
            .select(TaskMap.status, this.status)
            .checkbox(TaskMap.recurring, this.isRecurring)
            .select(TaskMap.size, this.size)
            .relation(TaskMap.pillars, this.pillars)
            .relation(TaskMap.projects, this.projects)
            .relation(TaskMap.practices, this.practices)
            .relation(TaskMap.people, this.people)
            .checkbox(TaskMap.autoGenerated, true);
        if (this.isSynchronizable()) {
            builder
                .date(TaskMap.lastSyncTime, DateFormatter.dateTime(new Date()))
                .richText(TaskMap.eventId, this.eventId)
                .select(TaskMap.calendar, this.calendar)
                .select(TaskMap.calendarId, this.calendarId);
        }

        return builder.build();
    }
}
