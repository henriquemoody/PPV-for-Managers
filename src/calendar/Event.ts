import {CALENDAR_IDS, CALENDAR_IGNORE_REGEXP} from '../config';

import DateFormatter from '../helpers/DateFormatter';

export default class Event {
    public id: string;
    public isAllDay: boolean;
    public isRecurring: boolean;
    public start: Date;
    public end: Date;
    public type: string;
    public status: string;
    public summary: string;
    public calendar: string;
    public attendees: {name: string; email: string}[];

    constructor(
        id: string,
        calendar: string,
        isAllDay: boolean,
        isRecurring: boolean,
        start: Date,
        end: Date,
        eventType: string,
        status: string,
        summary: string,
        attendees: {name: string; email: string}[]
    ) {
        this.id = id;
        this.calendar = calendar;
        this.isAllDay = isAllDay;
        this.isRecurring = isRecurring;
        this.start = start;
        this.end = end;
        this.type = eventType;
        this.status = status;
        this.summary = summary;
        this.attendees = attendees;
    }

    static createCalendarAndEvent(calendar: string, calendarEvent: GoogleAppsScript.Calendar.Schema.Event): Event {
        const allDay = !!calendarEvent.start.date;
        const isRecurring = !!calendarEvent.recurringEventId;
        let start: Date;
        let end: Date;
        if (allDay) {
            start = new Date(calendarEvent.start.date + 'T00:00:00');
            end = calendarEvent.end.date ? new Date(calendarEvent.end.date + 'T00:00:00') : start;
        } else {
            start = new Date(calendarEvent.start.dateTime);
            end = new Date(calendarEvent.end.dateTime);
        }

        let summary = calendarEvent.summary || '(No title)';
        if (isRecurring) {
            summary = summary + ' (' + DateFormatter.prettyShortDate(start) + ')';
        }

        return new Event(
            calendarEvent.id.split('@')[0],
            calendar,
            allDay,
            isRecurring,
            start,
            end,
            // @ts-ignore The library is outdated and doesn't have the eventType property
            calendarEvent.eventType,
            calendarEvent.status,
            summary,
            calendarEvent.attendees === undefined
                ? []
                : calendarEvent.attendees
                      .filter((attendee) => attendee.self === undefined || attendee.self === false)
                      .filter((attendee) => attendee.responseStatus !== 'declined')
                      .map((attendee) => {
                          return {
                              name: attendee.displayName,
                              email: attendee.email,
                          };
                      })
        );
    }

    get calendarId(): string {
        return CALENDAR_IDS[this.calendar];
    }

    toString() {
        let template = '%s (%s - %s) [%s]';
        if (this.isCanceled()) {
            template = '%s (canceled %s - %s) [%s]';
        }

        return Utilities.formatString(
            template,
            this.summary,
            DateFormatter.dateTime(this.start),
            DateFormatter.dateTime(this.end),
            this.calendar
        );
    }

    isSynchronizable(): boolean {
        return this.type === 'default' && !this.summary.match(CALENDAR_IGNORE_REGEXP);
    }

    isCanceled(): boolean {
        return this.status === 'cancelled';
    }
}
