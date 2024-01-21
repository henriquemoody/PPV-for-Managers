import {ARCHIVE_CANCELLED_EVENTS, CALENDAR_IDS, DRY_RUN_MODE} from './config';

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

function hourly() {
    try {
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
    notionClient.save(Notion.Habits.Page.createFromDayPage(dayPage));
    notionClient.save(Notion.Pulse.Page.createFromDayPage(dayPage));
    notionClient
        .query(new Notion.Schedule.DailyQuery(today))
        .map((result) => Notion.Schedule.Page.createFromQueryResult(result).toTask().addReplacement('Day', dayPage))
        .forEach((task) => notionClient.lazySave(task));
    notionClient.saveAll();
}

function weekly() {
    const weekPage = Notion.Week.Page.createFromDate(today);
    notionClient.save(weekPage);
    notionClient
        .query(new Notion.Schedule.WeeklyQuery())
        .map((result) => Notion.Schedule.Page.createFromQueryResult(result).toTask().addReplacement('Week', weekPage))
        .forEach((task) => notionClient.lazySave(task));
    notionClient.saveAll();
}

function monthly() {
    let monthPage = Notion.Month.Page.createFromDate(today);
    notionClient.save(monthPage);
    notionClient
        .query(new Notion.Schedule.MonthlyQuery())
        .map((result) => Notion.Schedule.Page.createFromQueryResult(result).toTask().addReplacement('Month', monthPage))
        .forEach((task) => notionClient.lazySave(task));
    notionClient.saveAll();
}

function syncCalendarToNotion(calendarName: string) {
    Logger.info('Synchronizing "%s" Calendar to Notion', calendarName);
    calendarClient.getAll(calendarName).forEach((event: Calendar.Event) => {
        const taskFromEvent = createTaskPageFromEvent(event);
        const result = notionClient.queryOne(new Notion.Task.FromCalendarEventQuery(event.id));

        if (result !== null) {
            const taskFromResult = Notion.Task.Page.createFromQueryResult(result);
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

    const formatSize = (event: Calendar.Event): Notion.Enum.Size => {
        if (event.isAllDay) {
            return Notion.Enum.Size.EXTRA_LARGE;
        }

        const differenceInMinutes = (event.end.getTime() - event.start.getTime()) / (1000 * 60);
        if (differenceInMinutes <= 15) {
            return Notion.Enum.Size.SMALL;
        }

        if (differenceInMinutes < 60) {
            return Notion.Enum.Size.MEDIUM;
        }

        if (differenceInMinutes < 90) {
            return Notion.Enum.Size.LARGE;
        }

        return Notion.Enum.Size.EXTRA_LARGE;
    };

    let start;
    let end;

    if (event.isAllDay) {
        let endDate = new Date(event.end);
        endDate.setDate(endDate.getDate() - 1);

        start = DateFormatter.date(new Date(event.start));
        end = DateFormatter.date(endDate);

        end = start === end ? null : end;
    } else {
        start = DateFormatter.dateTime(event.start);
        end = DateFormatter.dateTime(event.end);
    }

    return new Notion.Task.Page(
        event.summary || '',
        formatDescription(event.description) || null,
        event.status === 'cancelled' ? Notion.Enum.Status.CANCELED : Notion.Enum.Status.ACTIVE,
        Notion.Enum.Priority.SCHEDULED,
        formatSize(event),
        event.isRecurring,
        start,
        end,
        event.id,
        event.calendar
    );
}
