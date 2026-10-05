import { format, parseISO } from "date-fns";

import { CalendarEvent, CalendarEventType, CalendarFeed, Holiday } from "@/lib/types";
import { isWeekendKey } from "@/lib/calendar";

/**
 * These keys are date-only strings, so every formatter here round-trips through
 * `parseISO`/`format` in the host timezone, exactly like `lib/calendar.ts` does.
 * That is deliberate: pinning an `Intl` timeZone would re-project a local
 * midnight into another zone and could shift a date by a day relative to the
 * month grid. "Today" is the only value that needs a real zone, and that is
 * handled by `getTodayKey` in `lib/calendar.ts`.
 */

/** "21 September 2026" */
export function formatLongDate(dateKey: string) {
  return format(parseISO(dateKey), "d MMMM yyyy");
}

/** "21 Sep 2026" for dense tables. */
export function formatCompactDate(dateKey: string) {
  return format(parseISO(dateKey), "d MMM yyyy");
}

/** "Monday, 2 November 2026" */
export function formatLongDateWithWeekday(dateKey: string) {
  return format(parseISO(dateKey), "EEEE, d MMMM yyyy");
}

/**
 * Human date range. Single-day events get a weekday so holiday tables read
 * naturally: "Sunday, 8 November 2026".
 */
export function describeRange(startDate: string, endDate: string) {
  if (startDate === endDate) {
    return formatLongDateWithWeekday(startDate);
  }

  return `${formatLongDate(startDate)} to ${formatLongDate(endDate)}`;
}

export interface HolidayRow {
  id: string;
  name: string;
  date: string;
  /** Long date plus weekday, e.g. "Monday, 2 November 2026". */
  displayDate: string;
  category: string;
  source: string;
  /**
   * A gazetted holiday that lands on a Saturday or Sunday. The interactive
   * calendar deliberately does not mark these, because the day is already a
   * non-working Saturday or Sunday.
   */
  fallsOnWeekend: boolean;
  /** Only present when the university has published a description. */
  description?: string;
}

export function toHolidayRows(holidays: Holiday[]): HolidayRow[] {
  return [...holidays]
    .sort((left, right) => left.date.localeCompare(right.date))
    .map((holiday) => ({
      id: holiday.id,
      name: holiday.name,
      date: holiday.date,
      displayDate: formatLongDateWithWeekday(holiday.date),
      category: holiday.category,
      source: holiday.source,
      fallsOnWeekend: isWeekendKey(holiday.date),
      description: holiday.description
    }));
}

/** "November 2026" — the heading used by the holiday month index. */
export function formatMonthHeading(dateKey: string) {
  return format(parseISO(dateKey), "MMMM yyyy");
}

/**
 * Holidays bucketed by month, so long-tail queries like "GGSIPU holidays in
 * November 2026" land on a heading that contains both the month and the year.
 */
export function groupHolidaysByMonth(rows: HolidayRow[]) {
  const buckets = new Map<string, string[]>();

  for (const row of rows) {
    const heading = formatMonthHeading(row.date);
    const entries = buckets.get(heading) ?? [];
    entries.push(`${formatCompactDate(row.date)} — ${row.name}`);
    buckets.set(heading, entries);
  }

  return Array.from(buckets, ([month, entries]) => ({ month, entries }));
}

export interface EventRow {
  id: string;
  title: string;
  type: CalendarEventType;
  /** "Mid-Term Examinations – I" style category label. */
  category: string;
  semesterId: string;
  startDate: string;
  endDate: string;
  displayRange: string;
  duration: string;
  description: string;
  source: string;
}

/** Event type order used for grouping: the dates students plan around come first. */
const eventGroupOrder: CalendarEventType[] = [
  "exam",
  "deadline",
  "registration",
  "class",
  "notice",
  "break"
];

const eventGroupLabels: Record<CalendarEventType, string> = {
  exam: "Examinations",
  deadline: "Submissions and deadlines",
  registration: "Registration",
  class: "Classes",
  notice: "Campus events and notices",
  break: "Vacations",
  holiday: "Holidays"
};

export function eventGroupLabel(type: CalendarEventType) {
  return eventGroupLabels[type];
}

export function toEventRows(events: CalendarEvent[]): EventRow[] {
  return [...events]
    .sort((left, right) => left.startDate.localeCompare(right.startDate))
    .map((event) => {
      const days =
        Math.round(
          (parseISO(event.endDate).getTime() - parseISO(event.startDate).getTime()) /
            86_400_000
        ) + 1;

      return {
        id: event.id,
        title: event.title,
        type: event.type,
        category: eventTypeCategoryLabel(event.type),
        semesterId: event.semesterId,
        startDate: event.startDate,
        endDate: event.endDate,
        displayRange: describeRange(event.startDate, event.endDate),
        duration: days === 1 ? "1 day" : `${days} days`,
        description: event.description,
        source: event.source
      };
    });
}

function eventTypeCategoryLabel(type: CalendarEventType) {
  return eventGroupLabels[type] ?? type;
}

export interface EventGroup {
  type: CalendarEventType;
  label: string;
  events: EventRow[];
}

/** Groups a semester's events into crawlable, labelled sections. */
export function groupEventsByType(feed: CalendarFeed, semesterId: string): EventGroup[] {
  const rows = toEventRows(feed.events.filter((event) => event.semesterId === semesterId));

  return eventGroupOrder
    .map((type) => ({
      type,
      label: eventGroupLabels[type],
      events: rows.filter((row) => row.type === type)
    }))
    .filter((group) => group.events.length > 0);
}

/** Exam and deadline dates, which is what "exam dates" queries want to see. */
export function assessmentEvents(feed: CalendarFeed, semesterId?: string) {
  return feed.events
    .filter((event) => event.type === "exam" || event.type === "deadline")
    .filter((event) => !semesterId || event.semesterId === semesterId)
    .sort((left, right) => left.startDate.localeCompare(right.startDate));
}

export function semesterNameFor(feed: CalendarFeed, semesterId: string) {
  return feed.semesters.find((semester) => semester.id === semesterId)?.name ?? semesterId;
}

