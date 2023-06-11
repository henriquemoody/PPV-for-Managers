import {CALENDAR_IDS, RELATIVE_MAX_DAY, RELATIVE_MIN_DAY} from '../config';

import Event from './Event';
import Logger from '../helpers/Logger';

function getRelativeDate(daysOffset) {
    let date = new Date();
    date.setDate(date.getDate() + daysOffset);
    date.setHours(0, 0, 0, 0);

    return date;
}

export default class EventClient {
    public readonly modifiedEventIds: Set<string>;

    constructor() {
        this.modifiedEventIds = new Set<string>();
    }

    get(calendar: string, eventId: string): Event | null {
        try {
            return Event.create(calendar, Calendar.Events.get(CALENDAR_IDS[calendar], eventId));
        } catch (error) {
            Logger.warn('Failed to get event "%s" from "%s"', eventId, calendar);
            Logger.warn(error.message);
            return null;
        }
    }

    getAll(calendarName: string): Event[] {
        const options = {
            maxResults: 100,
            showDeleted: true,
            singleEvents: true, // allow recurring events,
            timeMin: getRelativeDate(-RELATIVE_MIN_DAY).toISOString(),
            timeMax: getRelativeDate(RELATIVE_MAX_DAY).toISOString(),
            pageToken: undefined,
        };

        const events = new Array<Event>();

        do {
            const batchOfEvents = Calendar.Events.list(CALENDAR_IDS[calendarName], options);
            if (batchOfEvents.items && batchOfEvents.items.length === 0) {
                Logger.info('No events found in "%s"', calendarName);
                break;
            }

            for (let i = 0; i < batchOfEvents.items.length; i++) {
                let event = Event.create(calendarName, batchOfEvents.items[i]);
                if (!event.isSynchronizable()) {
                    Logger.debug('Ignoring because it is not allowed to sync => "%s" (%s [%s])', event.getReference());
                    continue;
                }

                if (this.modifiedEventIds.has(event.id)) {
                    Logger.debug('Ignoring due to list of ignored ids "%s"', event.summary, event.id);
                    continue;
                }

                events.push(event);
            }

            options.pageToken = batchOfEvents.nextPageToken;
        } while (options.pageToken);

        return events;
    }

    delete(event: Event): void {
        Logger.info('Deleting event on Calendar => %s', event.getReference());
        CalendarApp.getCalendarById(event.calendarId).getEventById(event.id).deleteEvent();

        this.modifiedEventIds.add(event.id);
    }

    save(event: Event): void {
        if (event.id) {
            Logger.info('Updating on Calendar => %s', event.getReference());
            this.update(event);
            return;
        }

        Logger.info('Creating on Calendar => %s', event.getReference());
        // this.create(event);
    }

    private create(event: Event): void {
        const calendar = CalendarApp.getCalendarById(event.calendarId);
        const options = {description: event.description};

        if (!event.allDay) {
            const createdEvent = calendar.createEvent(event.summary, event.start, event.end, options);
            event.updateId(createdEvent.getId());
            this.modifiedEventIds.add(event.id);
            return;
        }

        const endDate = new Date(event.end);
        endDate.setDate(endDate.getDate() + 1);

        const createdEvent = calendar.createAllDayEvent(event.summary, event.start, endDate, options);
        event.updateId(createdEvent.getId());

        this.modifiedEventIds.add(event.id);
    }

    private update(event: Event): void {
        const calendarEvent = CalendarApp.getCalendarById(event.calendarId).getEventById(event.id);

        calendarEvent.setTitle(event.summary);

        if (event.allDay) {
            event.end.setDate(event.end.getDate() + 2);
            calendarEvent.setAllDayDates(event.start, event.end);
            return;
        }

        calendarEvent.setTime(event.start, event.end);

        this.modifiedEventIds.add(event.id);
    }
}