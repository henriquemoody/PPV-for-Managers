import {TASKS_DATABASE_ID, CALENDAR_IDS} from '../../config';

import DateFormatter from '../../helpers/DateFormatter';
import Formatter from '../Formatter';
import Page from '../Page';
import PropertiesBuilder from '../PropertiesBuilder';
import TaskMap from './TaskMap';
import {Status} from '../enums';
import {Result} from '../types';

export default class TaskPage extends Page {
    public eventId?: string;
    public start: string;
    public end?: string;
    public quickNote: string | null;
    public status: Status;
    public priority: string;
    public calendar?: string;
    public pillars: Array<string>;
    public projects: Array<string>;
    public lastSyncTime?: Date;
    public lastEditedTime: Date;

    constructor(
        title: string,
        quickNote: string | null,
        status: Status,
        priority: string,
        start,
        end?,
        eventId?,
        calendar?
    ) {
        super(TASKS_DATABASE_ID, title);
        this.start = start;
        this.end = end;
        this.quickNote = quickNote;
        this.status = status;
        this.priority = priority;
        this.eventId = eventId;
        this.calendar = calendar;
        this.pillars = [];
        this.projects = [];
    }

    static createFromResult(result: Result): TaskPage {
        const taskPage = new TaskPage(
            Formatter.title(result.properties[TaskMap.title]),
            Formatter.richText(result.properties[TaskMap.quickNote]),
            <Status>Formatter.select(result.properties[TaskMap.status]),
            Formatter.select(result.properties[TaskMap.priority]),
            Formatter.dateStart(result.properties[TaskMap.date]),
            Formatter.dateEnd(result.properties[TaskMap.date]),
            Formatter.richText(result.properties[TaskMap.eventId]),
            Formatter.select(result.properties[TaskMap.calendar])
        );
        taskPage.id = result.id;
        taskPage.lastSyncTime = new Date(result.properties[TaskMap.lastSyncTime]);
        taskPage.lastEditedTime = new Date(result.last_edited_time);
        taskPage.pillars = Formatter.relation(result.properties[TaskMap.pillars]);
        taskPage.projects = Formatter.relation(result.properties[TaskMap.projects]);

        return taskPage;
    }

    get calendarId(): string {
        return CALENDAR_IDS[this.calendar];
    }

    merge(task: TaskPage): void {
        this.id = task.id;
        this.pillars = task.pillars || [];
        this.projects = task.projects || [];
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

    toProperties(): object {
        const builder = new PropertiesBuilder();
        builder.title(TaskMap.title, this.title);
        builder.date(TaskMap.date, this.start, this.end);
        builder.select(TaskMap.priority, this.priority);
        builder.select(TaskMap.status, this.status);

        if (this.quickNote) {
            builder.richText(TaskMap.quickNote, this.quickNote);
        }

        if (this.pillars.length > 0) {
            builder.relation(TaskMap.pillars, this.pillars);
        }

        if (this.projects.length > 0) {
            builder.relation(TaskMap.projects, this.projects);
        }

        if (this.isSynchronizable()) {
            builder.date(TaskMap.lastSyncTime, DateFormatter.dateTime(new Date()));
            builder.richText(TaskMap.eventId, this.eventId);
            builder.select(TaskMap.calendar, this.calendar);
            builder.select(TaskMap.calendarId, this.calendarId);
        }

        return builder.build();
    }
}
