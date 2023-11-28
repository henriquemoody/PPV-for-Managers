import {TASKS_DATABASE_ID, CALENDAR_IDS} from '../../config';

import DateFormatter from '../../helpers/DateFormatter';
import PropertiesFormatter from '../PropertiesFormatter';
import Page from '../Page';
import PropertiesBuilder from '../PropertiesBuilder';
import TaskMap from './TaskMap';
import {Size, Status} from '../enums';
import {Result} from '../types';
import Replacement from '../Replacement';

export default class TaskPage extends Page {
    public eventId?: string;
    public start: string;
    public end?: string;
    public quickNote: string | null;
    public status: Status;
    public priority: string;
    public size?: Size | null;
    public calendar?: string;
    public pillars: Array<string>;
    public projects: Array<string>;
    public practices: Array<string>;
    public lastSyncTime?: Date;
    public lastEditedTime: Date;
    public replacement?: Replacement;
    public isRecurring: boolean;

    constructor(
        title: string,
        quickNote: string | null,
        status: Status,
        priority: string,
        size: Size | null,
        isRecurring: boolean,
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
        this.size = size;
        this.isRecurring = isRecurring;
        this.eventId = eventId;
        this.calendar = calendar;
        this.pillars = [];
        this.projects = [];
        this.practices = [];
    }

    static createFromResult(result: Result): TaskPage {
        const formatter = new PropertiesFormatter(result.properties);
        const taskPage = new TaskPage(
            formatter.title(TaskMap.title),
            formatter.richText(TaskMap.quickNote),
            <Status>formatter.select(TaskMap.status),
            formatter.select(TaskMap.priority),
            <Size>formatter.select(TaskMap.size),
            formatter.checkbox(TaskMap.recurring),
            formatter.dateStart(TaskMap.date),
            formatter.dateEnd(TaskMap.date),
            formatter.richText(TaskMap.eventId),
            formatter.select(TaskMap.calendar)
        );
        taskPage.id = result.id;
        taskPage.lastSyncTime = new Date(TaskMap.lastSyncTime);
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
        const builder = new PropertiesBuilder();
        builder.title(TaskMap.title, this.title, this.replacement);
        builder.date(TaskMap.date, this.start, this.end);
        builder.select(TaskMap.priority, this.priority);
        builder.select(TaskMap.status, this.status);
        builder.checkbox(TaskMap.recurring, this.isRecurring);
        if (this.size) {
            builder.select(TaskMap.size, this.size);
        }

        if (this.quickNote) {
            builder.richText(TaskMap.quickNote, this.quickNote);
        }

        builder.relation(TaskMap.pillars, this.pillars);
        builder.relation(TaskMap.projects, this.projects);
        builder.relation(TaskMap.practices, this.practices);
        if (this.isSynchronizable()) {
            builder.date(TaskMap.lastSyncTime, DateFormatter.dateTime(new Date()));
            builder.richText(TaskMap.eventId, this.eventId);
            builder.select(TaskMap.calendar, this.calendar);
            builder.select(TaskMap.calendarId, this.calendarId);
        }

        return builder.build();
    }
}
