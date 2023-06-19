import {CALENDAR_IDS, DRY_RUN_MODE, RELATIVE_MAX_DAY, RELATIVE_MIN_DAY} from '../config';

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
            return Event.createCalendarAndEvent(calendar, Calendar.Events.get(CALENDAR_IDS[calendar], eventId));
        } catch (error) {
            Logger.debug(error);
            Logger.warn('Failed to get event "%s" from "%s"', eventId, calendar);
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
                let event = Event.createCalendarAndEvent(calendarName, batchOfEvents.items[i]);
                if (!event.isSynchronizable()) {
                    Logger.debug('Ignoring because it is not allowed to sync => "%s" (%s [%s])', event.toString());
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
        Logger.info('Deleting event on Calendar => %s', event.toString());
        !DRY_RUN_MODE && CalendarApp.getCalendarById(event.calendarId).getEventById(event.id).deleteEvent();

        this.modifiedEventIds.add(event.id);
    }

    save(event: Event): void {
        if (event.id) {
            Logger.info('Updating on Calendar => %s', event.toString());
            this.update(event);
            return;
        }

        Logger.info('Creating on Calendar => %s', event.toString());
        this.create(event);
    }

    private create(event: Event): void {
        if (DRY_RUN_MODE) {
            event.updateId((Math.random() + 1).toString(36).substring(2));
            this.modifiedEventIds.add(event.id);
            return;
        }

        const calendar = CalendarApp.getCalendarById(event.calendarId);
        const options = {description: event.description};

        if (!event.allDay) {
            const createdEvent = calendar.createEvent(event.summary, event.start, event.end, options);
            event.updateId(createdEvent.getId());
            this.modifiedEventIds.add(event.id);
            return;
        }

        const createdEvent = calendar.createAllDayEvent(event.summary, event.start, event.end, options);

        event.updateId(createdEvent.getId());

        this.modifiedEventIds.add(event.id);
    }

    private update(event: Event): void {
        this.modifiedEventIds.add(event.id);

        if (DRY_RUN_MODE) {
            return;
        }

        const calendarEvent = CalendarApp.getCalendarById(event.calendarId).getEventById(event.id);

        calendarEvent.setTitle(event.summary);
        if (event.allDay) {
            calendarEvent.setAllDayDates(event.start, event.end);
            return;
        }
        calendarEvent.setTime(event.start, event.end);
    }
}
