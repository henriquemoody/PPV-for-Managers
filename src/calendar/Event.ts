import {CALENDAR_IDS} from '../config';

import DateFormatter from '../helpers/DateFormatter';
import Logger from '../helpers/Logger';
import TaskPage from '../notion/Task/TaskPage';
import {Status} from '../notion/enums';

export default class Event {
    public id?: string;
    public allDay: boolean;
    public start: Date;
    public end: Date;
    public type: string;
    public status: string;
    public summary: string;
    public description?: string;
    public calendar: string;

    constructor(
        calendar: string,
        allDay: boolean,
        start: Date,
        end: Date,
        eventType: string,
        status: string,
        summary: string,
        description?: string
    ) {
        this.calendar = calendar;
        this.allDay = allDay;
        this.start = start;
        this.end = end;
        this.type = eventType;
        this.status = status;
        this.summary = summary;
        this.description = description;
    }

    static createCalendarAndEvent(calendar: string, calendarEvent: GoogleAppsScript.Calendar.Schema.Event): Event {
        const allDay = !!calendarEvent.start.date;
        let start: Date;
        let end: Date;
        if (allDay) {
            start = new Date(calendarEvent.start.date + 'T00:00:00');
            end = new Date(calendarEvent.end.date + 'T00:00:00');
        } else {
            start = new Date(calendarEvent.start.dateTime);
            end = new Date(calendarEvent.end.dateTime);
        }

        const event = new Event(
            calendar,
            allDay,
            start,
            end,
            // @ts-ignore The library is outdated and doesn't have the eventType property
            calendarEvent.eventType,
            calendarEvent.status,
            calendarEvent.summary || '(No title)',
            calendarEvent.description || null
        );
        event.updateId(calendarEvent.id);

        return event;
    }

    static createFromTask(task: TaskPage) {
        let allDay = false;
        let start = task.start;
        let end = task.end;

        if (start.length === 10) {
            start += 'T00:00:00';
            allDay = true;
        }

        if (end.length === 10) {
            end += 'T00:00:00';
            allDay = true;
        }

        const event = new Event(
            task.calendar,
            allDay,
            new Date(start),
            new Date(end),
            'default',
            task.status === Status.CANCELED ? 'cancelled' : 'confirmed',
            task.title,
            task.quickNote
        );
        event.id = task.eventId;

        return event;
    }

    get calendarId(): string {
        return CALENDAR_IDS[this.calendar];
    }

    getReference() {
        return Utilities.formatString('%s [%s - %s]', this.summary, this.start, this.end);
    }

    updateId(id: string) {
        this.id = id.split('@')[0];
    }

    isUpToDate(event: Event): boolean {
        return (
            this.id === event.id &&
            this.allDay === event.allDay &&
            this.start.toISOString() === event.start.toISOString() &&
            this.end.toISOString() === event.end.toISOString() &&
            this.type === event.type &&
            this.status === event.status &&
            this.summary === event.summary
        );
    }

    merge(event: Event): void {
        this.id = event.id;
        this.allDay = event.allDay;
        this.start = event.start;
        this.end = event.end;
        this.summary = event.summary;
    }

    isSynchronizable(): boolean {
        return (
            this.type === 'default' &&
            this.summary != 'Innovation: Check-in' &&
            this.summary != 'Innovation: Focus time'
        );
    }

    isCanceled(): boolean {
        return this.status === 'cancelled';
    }
}
