import {ARCHIVE_CANCELLED_EVENTS, CALENDAR_IDS, DELETE_CANCELLED_EVENTS, UPDATE_CHANGED_EVENTS} from './config';

import * as Calendar from './calendar';
import * as Notion from './notion';
import Logger from './helpers/Logger';

const notionClient = new Notion.Client();
const calendarClient = new Calendar.Client();

const today = new Date();
today.setHours(0, 0, 0, 0);

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
    notionClient.lazySave(Notion.Day.Page.createFromDate(today));
    if (today.getDay() === 1) {
        notionClient.lazySave(Notion.Week.Page.createFromDate(today));
    }
    notionClient
        .query(new Notion.Schedule.ByDateQuery(today))
        .map((result) => Notion.Schedule.Page.createFromResult(result).toTask())
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
            Logger.debug('No changes made since last sync => %s', task.getReference());
            continue;
        }

        if (new Date(task.start) < today) {
            Logger.debug('Ignoring past event => %s', task.getReference());
            continue;
        }

        const eventFromTask = Calendar.Event.createFromTask(task);
        const eventFromCalendar = calendarClient.get(task.calendar, task.eventId);
        if (!eventFromCalendar) {
            calendarClient.save(eventFromTask);
            continue;
        }

        if (eventFromTask.isCanceled()) {
            Logger.debug('Ignoring cancelled event => %s', task.getReference());
            continue;
        }

        if (eventFromCalendar.isUpToDate(eventFromTask)) {
            Logger.debug('Skipping up-to-dated => %s', task.getReference());
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
        const taskFromEvent = Notion.Task.Page.createFromEvent(event);
        const result = notionClient.queryOne(new Notion.Task.FromCalendarEventQuery(event.id));

        if (result !== null) {
            const taskFromResult = Notion.Task.Page.createFromResult(result);
            taskFromEvent.merge(taskFromResult);
            if (taskFromResult.isUpToDate(taskFromEvent)) {
                Logger.debug('Skipping up-to-dated => %s', taskFromResult.getReference());
                return;
            }
            Logger.debug('Calendar', taskFromEvent);
            Logger.debug('Notion', taskFromResult);

            notionClient.lazySave(taskFromEvent);
            return;
        }

        if (taskFromEvent.isArchived()) {
            Logger.debug('Skipping canceled and absent in Notion => %s', taskFromEvent.getReference());
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
        if (event.isCanceled()) {
            Logger.debug('Ignoring already cancelled event => %s', task.getReference());
            continue;
        }

        calendarClient.delete(event);

        if (ARCHIVE_CANCELLED_EVENTS) {
            notionClient.save(task);
        }
    }
}
