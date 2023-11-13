import {
    ARCHIVE_CANCELLED_EVENTS,
    CALENDAR_IDS,
    DELETE_CANCELLED_EVENTS,
    DRY_RUN_MODE,
    UPDATE_CHANGED_EVENTS,
} from './config';

import * as Calendar from './calendar';
import * as Notion from './notion';
import DateFormatter from './helpers/DateFormatter';
import Logger from './helpers/Logger';

const notionClient = new Notion.Client();
const calendarClient = new Calendar.Client();

const today = new Date();
today.setHours(0, 0, 0, 0);

Logger.debug('DRY_RUN_MODE', DRY_RUN_MODE);
Logger.debug('ARCHIVE_CANCELLED_EVENTS', ARCHIVE_CANCELLED_EVENTS);
Logger.debug('DELETE_CANCELLED_EVENTS', DELETE_CANCELLED_EVENTS);
Logger.debug('UPDATE_CHANGED_EVENTS', UPDATE_CHANGED_EVENTS);

function hourly() {
    try {
        if (DELETE_CANCELLED_EVENTS) {
            deleteCancelledEvents();
        }

        if (UPDATE_CHANGED_EVENTS) {
            syncNotionToCalendar();
        }

        for (const calendarName of Object.keys(CALENDAR_IDS)) {
            syncCalendarToNotion(calendarName);
        }
    } catch (error) {
        Logger.error(error.message);
        throw error;
    }
}

function daily() {
    const dayPage = Notion.Day.Page.createFromDate(today);
    notionClient.save(dayPage);
    notionClient
        .query(new Notion.Schedule.DailyQuery(today))
        .map((result) => Notion.Schedule.Page.createFromResult(result).toTask().addReplacement('Day', dayPage))
        .forEach((task) => notionClient.lazySave(task));
    notionClient.saveAll();
}

function weekly() {
    const weekPage = Notion.Week.Page.createFromDate(today);
    notionClient.save(weekPage);
    notionClient
        .query(new Notion.Schedule.WeeklyQuery())
        .map((result) => Notion.Schedule.Page.createFromResult(result).toTask().addReplacement('Week', weekPage))
        .forEach((task) => notionClient.lazySave(task));
    notionClient.saveAll();
}

function monthly() {
    let monthPage = Notion.Month.Page.createFromDate(today);
    notionClient.save(monthPage);
    notionClient
        .query(new Notion.Schedule.MonthlyQuery())
        .map((result) => Notion.Schedule.Page.createFromResult(result).toTask().addReplacement('Month', monthPage))
        .forEach((task) => notionClient.lazySave(task));
    notionClient.saveAll();
}

function syncNotionToCalendar() {
    Logger.info('Synchronizing Notion to Calendar');
    const results = notionClient.query(new Notion.Task.LatestQuery());

    for (const result in results) {
        Logger.debug('Result', JSON.stringify(results[result]));
        const task = Notion.Task.Page.createFromResult(results[result]);

        if (!task.isSynchronizable()) {
            continue;
        }

        if (task.lastSyncTime && new Date(task.lastEditedTime) > new Date(task.lastSyncTime)) {
            Logger.debug('No changes made since last sync => %s', task.toString());
            continue;
        }

        if (new Date(task.start) < today) {
            Logger.debug('Ignoring past event => %s', task.toString());
            continue;
        }

        const eventFromTask = createEventFromTaskPage(task);
        const eventFromCalendar = calendarClient.get(task.calendar, task.eventId);
        if (!eventFromCalendar) {
            calendarClient.save(eventFromTask);
            task.eventId = eventFromTask.id;
            notionClient.save(task);
            continue;
        }

        if (eventFromCalendar.isCanceled()) {
            Logger.debug('Ignoring cancelled event => %s', task.toString());
            continue;
        }

        if (eventFromCalendar.isUpToDate(eventFromTask)) {
            Logger.debug('Skipping up-to-dated => %s', task.toString());
            continue;
        }

        Logger.debug('eventFromTask', JSON.stringify(eventFromTask));
        Logger.debug('eventFromCalendar', JSON.stringify(eventFromCalendar));

        eventFromCalendar.merge(eventFromTask);
        calendarClient.save(eventFromCalendar);
    }
}

function syncCalendarToNotion(calendarName: string) {
    Logger.info('Synchronizing "%s" Calendar to Notion', calendarName);
    calendarClient.getAll(calendarName).forEach((event: Calendar.Event) => {
        const taskFromEvent = createTaskPageFromEvent(event);
        const result = notionClient.queryOne(new Notion.Task.FromCalendarEventQuery(event.id));

        if (result !== null) {
            const taskFromResult = Notion.Task.Page.createFromResult(result);
            taskFromEvent.merge(taskFromResult);
            if (taskFromResult.isUpToDate(taskFromEvent)) {
                Logger.debug('Skipping up-to-dated => %s', taskFromResult.toString());
                return;
            }
            Logger.debug('Calendar', taskFromEvent);
            Logger.debug('Notion', taskFromResult);

            notionClient.lazySave(taskFromEvent);
            return;
        }

        if (taskFromEvent.isArchived()) {
            Logger.debug('Skipping canceled and absent in Notion => %s', taskFromEvent.toString());
            return;
        }

        notionClient.lazySave(taskFromEvent);
    });

    notionClient.saveAll();
}

function deleteCancelledEvents() {
    Logger.info('Deleting cancel tagged events from Calendar');

    const results = notionClient.query(new Notion.Task.CanceledQuery());

    for (const result in results) {
        const task = Notion.Task.Page.createFromResult(results[result]);
        const event = calendarClient.get(task.calendarId, task.eventId);
        if (!event) {
            Logger.debug('Could not task in Calendar => %s', task.toString());
            continue;
        }

        if (event.isCanceled()) {
            Logger.debug('Ignoring already cancelled event => %s', task.toString());
            continue;
        }

        calendarClient.delete(event);

        if (ARCHIVE_CANCELLED_EVENTS) {
            notionClient.save(task);
        }
    }
}

function createTaskPageFromEvent(event: Calendar.Event): Notion.Task.Page {
    const formatDescription = (description: string): string | null => {
        if (!description) {
            return null;
        }

        const formatted = description
            .replace(/<br\/?>/g, '\n')
            .replace(/\s+/g, ' ')
            .replace(/<[^>]+>/g, '')
            .trim();
        if (formatted.length <= 250) {
            return formatted;
        }

        return formatted.substring(0, 247) + '...';
    };

    let start;
    let end;

    if (event.allDay) {
        let endDate = new Date(event.end);
        endDate.setDate(endDate.getDate() - 1);

        start = DateFormatter.date(new Date(event.start));
        end = DateFormatter.date(endDate);

        end = start === end ? null : end;
    } else {
        start = DateFormatter.dateTime(new Date(event.start));
        end = DateFormatter.dateTime(new Date(event.end));
    }

    return new Notion.Task.Page(
        event.summary || '',
        formatDescription(event.description) || null,
        event.status === 'cancelled' ? Notion.Enum.Status.CANCELED : Notion.Enum.Status.ACTIVE,
        Notion.Enum.Priority.SCHEDULED,
        null,
        start,
        end || null,
        event.id,
        event.calendar
    );
}

function createEventFromTaskPage(taskPage: Notion.Task.Page): Calendar.Event {
    let allDay = false;
    let start = taskPage.start;
    let end = taskPage.end;

    if (start.length === 10) {
        start += 'T00:00:00';
        allDay = true;
    }

    if (end && end.length === 10) {
        end += 'T00:00:00';
        allDay = true;
    }

    if (!end && allDay) {
        const endDate = new Date(start);
        endDate.setDate(endDate.getDate() + 1);
        end = DateFormatter.date(endDate) + 'T00:00:00';
    }

    const event = new Calendar.Event(
        taskPage.calendar,
        allDay,
        new Date(start),
        new Date(end),
        'default',
        taskPage.status === Notion.Enum.Status.CANCELED ? 'cancelled' : 'confirmed',
        taskPage.title,
        taskPage.quickNote
    );
    event.id = taskPage.eventId;

    return event;
}
