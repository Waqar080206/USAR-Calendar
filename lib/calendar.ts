import {
  addDays,
  compareAsc,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  isBefore,
  isEqual,
  isSameDay,
  parseISO,
  startOfMonth,
  startOfWeek
} from "date-fns";

import {
  CalendarEvent,
  CalendarEventType,
  CalendarFeed,
  getSemester,
  Holiday,
  SemesterConfig,
  SemesterScope,
  SemesterStats
} from "@/lib/types";

export interface CalendarItem extends CalendarEvent {
  sourceType: "event" | "holiday";
  holidayCategory?: string;
}

export const eventTypeOrder: CalendarEventType[] = [
  "holiday",
  "exam",
  "deadline",
  "registration",
  "break",
  "class",
  "notice"
];

export interface EventTypeMeta {
  label: string;
  shortLabel: string;
  /** Solid fill used for dots, bars and the progress ring. */
  accentClass: string;
  /** Soft text-on-tint chip used on calendar cells and agenda rows. */
  chipClass: string;
  /** Selected/hovered surface. */
  surfaceClass: string;
  /** Outline chip used for the filter row. */
  outlineClass: string;
  /** Resolved hex-free gradient used by month range bars. */
  gradientClass: string;
}

export const eventTypeMeta: Record<CalendarEventType, EventTypeMeta> = {
  registration: {
    label: "Registration",
    shortLabel: "Reg",
    accentClass: "bg-emerald-500",
    chipClass:
      "bg-emerald-100 text-emerald-900 ring-emerald-600/15 dark:bg-emerald-400/15 dark:text-emerald-200",
    surfaceClass:
      "bg-emerald-50/90 text-emerald-950 dark:bg-emerald-400/12 dark:text-emerald-100",
    outlineClass:
      "border-emerald-500/30 bg-emerald-500/8 text-emerald-800 dark:text-emerald-200",
    gradientClass: "from-emerald-400 to-emerald-600"
  },
  class: {
    label: "Class",
    shortLabel: "Class",
    accentClass: "bg-sky-500",
    chipClass:
      "bg-sky-100 text-sky-900 ring-sky-600/15 dark:bg-sky-400/15 dark:text-sky-200",
    surfaceClass: "bg-sky-50/90 text-sky-950 dark:bg-sky-400/12 dark:text-sky-100",
    outlineClass: "border-sky-500/30 bg-sky-500/8 text-sky-800 dark:text-sky-200",
    gradientClass: "from-sky-400 to-sky-600"
  },
  exam: {
    label: "Exam",
    shortLabel: "Exam",
    accentClass: "bg-rose-500",
    chipClass:
      "bg-rose-100 text-rose-900 ring-rose-600/15 dark:bg-rose-400/15 dark:text-rose-200",
    surfaceClass: "bg-rose-50/90 text-rose-950 dark:bg-rose-400/12 dark:text-rose-100",
    outlineClass: "border-rose-500/30 bg-rose-500/8 text-rose-800 dark:text-rose-200",
    gradientClass: "from-rose-400 to-rose-600"
  },
  holiday: {
    label: "Holiday",
    shortLabel: "Hol",
    accentClass: "bg-amber-500",
    chipClass:
      "bg-amber-100 text-amber-900 ring-amber-600/15 dark:bg-amber-400/15 dark:text-amber-200",
    surfaceClass: "bg-amber-50/90 text-amber-950 dark:bg-amber-400/12 dark:text-amber-100",
    outlineClass:
      "border-amber-500/30 bg-amber-500/8 text-amber-800 dark:text-amber-200",
    gradientClass: "from-amber-400 to-amber-600"
  },
  break: {
    label: "Break",
    shortLabel: "Break",
    accentClass: "bg-violet-500",
    chipClass:
      "bg-violet-100 text-violet-900 ring-violet-600/15 dark:bg-violet-400/15 dark:text-violet-200",
    surfaceClass:
      "bg-violet-50/90 text-violet-950 dark:bg-violet-400/12 dark:text-violet-100",
    outlineClass:
      "border-violet-500/30 bg-violet-500/8 text-violet-800 dark:text-violet-200",
    gradientClass: "from-violet-400 to-violet-600"
  },
  deadline: {
    label: "Deadline",
    shortLabel: "Due",
    accentClass: "bg-orange-500",
    chipClass:
      "bg-orange-100 text-orange-900 ring-orange-600/15 dark:bg-orange-400/15 dark:text-orange-200",
    surfaceClass:
      "bg-orange-50/90 text-orange-950 dark:bg-orange-400/12 dark:text-orange-100",
    outlineClass:
      "border-orange-500/30 bg-orange-500/8 text-orange-800 dark:text-orange-200",
    gradientClass: "from-orange-400 to-orange-600"
  },
  notice: {
    label: "Notice",
    shortLabel: "Note",
    accentClass: "bg-slate-500",
    chipClass:
      "bg-slate-200/80 text-slate-900 ring-slate-600/15 dark:bg-slate-400/15 dark:text-slate-100",
    surfaceClass:
      "bg-slate-100/90 text-slate-950 dark:bg-slate-400/12 dark:text-slate-100",
    outlineClass:
      "border-slate-500/30 bg-slate-500/8 text-slate-700 dark:text-slate-200",
    gradientClass: "from-slate-400 to-slate-600"
  }
};

export function getTodayKey(timezone: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());
}

export function toDateKey(date: Date) {
  return format(date, "yyyy-MM-dd");
}

export function toMonthKey(date: Date) {
  return format(date, "yyyy-MM");
}

export function parseDateKey(dateKey: string) {
  return parseISO(dateKey);
}

export function parseMonthKey(monthKey: string) {
  return parseISO(`${monthKey}-01`);
}

function holidayToItem(holiday: Holiday): CalendarItem {
  return {
    id: holiday.id,
    // Holidays belong to no single semester.
    semesterId: HOLIDAY_SEMESTER_ID,
    title: holiday.name,
    type: "holiday",
    startDate: holiday.date,
    endDate: holiday.date,
    allDay: true,
    description:
      holiday.description ??
      `${holiday.category}. Imported from the holiday list PDF.`,
    source: holiday.source,
    sourceType: "holiday",
    holidayCategory: holiday.category
  };
}

function compareItems(left: CalendarItem, right: CalendarItem) {
  const dateComparison = compareAsc(
    parseDateKey(left.startDate),
    parseDateKey(right.startDate)
  );

  if (dateComparison !== 0) {
    return dateComparison;
  }

  const typeComparison =
    eventTypeOrder.indexOf(left.type) - eventTypeOrder.indexOf(right.type);

  if (typeComparison !== 0) {
    return typeComparison;
  }

  return left.title.localeCompare(right.title);
}

/**
 * Holidays are calendar-wide, not owned by any one semester, so items built
 * from them are tagged with this sentinel rather than a real semester id.
 */
export const HOLIDAY_SEMESTER_ID = "*";

/**
 * A holiday landing on a Saturday or Sunday changes nothing: the day is already
 * a non-working day. Marking it again just adds noise, so those dates are left
 * out of the marked-holiday set and the item list. The dates themselves still
 * count as non-working through {@link isWeekendKey}.
 */
export function isMarkedHoliday(holiday: Holiday) {
  return !isWeekendKey(holiday.date);
}

export function filterMarkedHolidays(holidays: Holiday[]) {
  return holidays.filter(isMarkedHoliday);
}

/** Accepts a full {@link CalendarFeed} or a single {@link SemesterScope}. */
export function getCalendarItems(feed: {
  events: CalendarEvent[];
  holidays: Holiday[];
}) {
  return [
    ...feed.events.map((event) => ({
      ...event,
      sourceType: "event" as const
    })),
    ...filterMarkedHolidays(feed.holidays).map(holidayToItem)
  ].sort(compareItems);
}

/**
 * Resolves one semester out of the feed along with its own events. Holidays
 * stay attached because they are calendar-wide.
 */
export function getSemesterScope(
  feed: CalendarFeed,
  semesterId: string | null | undefined
): SemesterScope {
  const semester = getSemester(feed, semesterId);

  return {
    semester,
    events: feed.events.filter((event) => event.semesterId === semester.id),
    holidays: filterMarkedHolidays(feed.holidays),
    announcements: feed.announcements
  };
}



/**
 * The semester whose window contains the given date, falling back to the most
 * recent one that has already started, then to the first semester.
 */
export function getSemesterForDate(feed: CalendarFeed, dateKey: string) {
  const containing = feed.semesters.find(
    (semester) =>
      dateKey >= semester.startDate && dateKey <= semester.endDate
  );

  if (containing) {
    return containing;
  }

  const started = feed.semesters.filter(
    (semester) => semester.startDate <= dateKey
  );

  return started[0] ?? feed.semesters[0];
}

export function eventSpansDate(
  event: Pick<CalendarEvent, "startDate" | "endDate">,
  dateKey: string
) {
  const date = parseDateKey(dateKey);
  const start = parseDateKey(event.startDate);
  const end = parseDateKey(event.endDate);

  return (
    (isAfter(date, start) || isEqual(date, start)) &&
    (isBefore(date, end) || isEqual(date, end))
  );
}

export function getItemsForDate(items: CalendarItem[], dateKey: string) {
  return items.filter((item) => eventSpansDate(item, dateKey)).sort(compareItems);
}

export function getUpcomingItems(
  items: CalendarItem[],
  fromDateKey: string,
  limit = 10
) {
  const fromDate = parseDateKey(fromDateKey);

  return items
    .filter((item) => {
      const eventEnd = parseDateKey(item.endDate);
      return isAfter(eventEnd, fromDate) || isEqual(eventEnd, fromDate);
    })
    .sort(compareItems)
    .slice(0, limit);
}

export function getMonthDays(monthKey: string) {
  const month = parseMonthKey(monthKey);
  const start = startOfWeek(startOfMonth(month), {
    weekStartsOn: 0
  });
  const end = endOfWeek(endOfMonth(month), {
    weekStartsOn: 0
  });
  const days = eachDayOfInterval({ start, end });

  while (days.length < 42) {
    days.push(addDays(days[days.length - 1], 1));
  }

  return days;
}

export function getWeekDays(dateKey: string) {
  const date = parseDateKey(dateKey);
  const start = startOfWeek(date, {
    weekStartsOn: 0
  });

  return eachDayOfInterval({
    start,
    end: addDays(start, 6)
  });
}

export function getSemesterStats(
  semester: SemesterConfig,
  holidays: Holiday[],
  todayKey: string
): SemesterStats {
  const semesterStart = parseDateKey(semester.startDate);
  const semesterEnd = parseDateKey(semester.endDate);
  const today = parseDateKey(todayKey);
  const totalDays = eachDayOfInterval({
    start: semesterStart,
    end: semesterEnd
  }).length;

  const elapsedDays = isBefore(today, semesterStart)
    ? 0
    : isAfter(today, semesterEnd)
      ? totalDays
      : eachDayOfInterval({
          start: semesterStart,
          end: today
        }).length;

  const remainingStart = isBefore(today, semesterStart) ? semesterStart : today;
  const remainingDays = isAfter(remainingStart, semesterEnd)
    ? 0
    : eachDayOfInterval({
        start: remainingStart,
        end: semesterEnd
      }).length;

  const markedHolidays = filterMarkedHolidays(holidays);

  const holidayDateSet = new Set(
    markedHolidays
      .map((holiday) => holiday.date)
      .filter((holidayDate) => {
        const date = parseDateKey(holidayDate);
        return (
          (isAfter(date, semesterStart) || isEqual(date, semesterStart)) &&
          (isBefore(date, semesterEnd) || isEqual(date, semesterEnd))
        );
      })
  );

  const holidaysRemaining = markedHolidays.filter((holiday) => {
    const holidayDate = parseDateKey(holiday.date);
    return (
      (isAfter(holidayDate, remainingStart) || isEqual(holidayDate, remainingStart)) &&
      (isBefore(holidayDate, semesterEnd) || isEqual(holidayDate, semesterEnd))
    );
  }).length;

  const workingDaysRemaining = isAfter(remainingStart, semesterEnd)
    ? 0
    : eachDayOfInterval({
        start: remainingStart,
        end: semesterEnd
      }).filter((date) => {
        const weekday = date.getDay();
        return (
          semester.workingWeekdays.includes(weekday) &&
          !holidayDateSet.has(toDateKey(date))
        );
      }).length;

  return {
    totalDays,
    elapsedDays,
    remainingDays,
    workingDaysRemaining,
    holidaysRemaining
  };
}

export function getDisplayRange(item: Pick<CalendarItem, "startDate" | "endDate">) {
  const start = parseDateKey(item.startDate);
  const end = parseDateKey(item.endDate);

  if (isSameDay(start, end)) {
    return format(start, "EEE, d MMM yyyy");
  }

  return `${format(start, "d MMM")} - ${format(end, "d MMM yyyy")}`;
}

export function getDurationLabel(item: Pick<CalendarItem, "startDate" | "endDate">) {
  const start = parseDateKey(item.startDate);
  const end = parseDateKey(item.endDate);
  const days = eachDayOfInterval({ start, end }).length;

  return days === 1 ? "1 day" : `${days} days`;
}

export function filterItemsByTypes(
  items: CalendarItem[],
  activeTypes: CalendarEventType[]
) {
  if (activeTypes.length === 0) {
    return items;
  }

  return items.filter((item) => activeTypes.includes(item.type));
}

/**
 * Marked holiday dates, used for the amber day styling and for excluding days
 * from working-day maths. Weekend holidays are excluded on purpose: they are
 * already non-working, so keeping them would only double count.
 */
export function getHolidayDateSet(feed: CalendarFeed) {
  return new Set(filterMarkedHolidays(feed.holidays).map((holiday) => holiday.date));
}

export function isWeekendKey(dateKey: string) {
  const day = parseDateKey(dateKey).getDay();

  return day === 0 || day === 6;
}

/**
 * Single source of truth for what counts as a working day. The semester config
 * owns `workingWeekdays`, so the header stat and the calculator can never drift.
 */
export function isWorkingDayKey(
  dateKey: string,
  workingWeekdays: number[],
  holidayDateSet: Set<string>
) {
  if (holidayDateSet.has(dateKey)) {
    return false;
  }

  return workingWeekdays.includes(parseDateKey(dateKey).getDay());
}

export interface WorkingDayBreakdown {
  calendarDays: number;
  workingDays: number;
  weekendDays: number;
  holidayDays: number;
}

export function getWorkingDayBreakdown(
  startDateKey: string,
  endDateKey: string,
  workingWeekdays: number[],
  holidayDateSet: Set<string>
): WorkingDayBreakdown {
  const start = parseDateKey(startDateKey);
  const end = parseDateKey(endDateKey);

  const from = isBefore(start, end) ? start : end;
  const to = isBefore(start, end) ? end : start;

  const breakdown: WorkingDayBreakdown = {
    calendarDays: 0,
    workingDays: 0,
    weekendDays: 0,
    holidayDays: 0
  };

  eachDayOfInterval({ start: from, end: to }).forEach((date) => {
    const dateKey = toDateKey(date);
    breakdown.calendarDays += 1;

    if (holidayDateSet.has(dateKey)) {
      // A holiday wins over a weekend so the buckets never double count.
      breakdown.holidayDays += 1;
      return;
    }

    if (workingWeekdays.includes(date.getDay())) {
      breakdown.workingDays += 1;
      return;
    }

    breakdown.weekendDays += 1;
  });

  return breakdown;
}

export function getItemsByDateKey(items: CalendarItem[]) {
  const index = new Map<string, CalendarItem[]>();

  items.forEach((item) => {
    const start = parseDateKey(item.startDate);
    const end = parseDateKey(item.endDate);

    eachDayOfInterval({ start, end }).forEach((date) => {
      const dateKey = toDateKey(date);
      const existing = index.get(dateKey);

      if (existing) {
        existing.push(item);
      } else {
        index.set(dateKey, [item]);
      }
    });
  });

  index.forEach((bucket) => bucket.sort(compareItems));

  return index;
}

export function getMonthWeeks(monthKey: string) {
  const days = getMonthDays(monthKey);
  const weeks: Date[][] = [];

  for (let index = 0; index < days.length; index += 7) {
    weeks.push(days.slice(index, index + 7));
  }

  return weeks;
}

export function getMonthEventCount(items: CalendarItem[], monthKey: string) {
  const monthStart = parseMonthKey(monthKey);
  const monthEnd = endOfMonth(monthStart);

  return items.filter((item) => {
    const start = parseDateKey(item.startDate);
    const end = parseDateKey(item.endDate);

    return (isBefore(start, monthEnd) || isEqual(start, monthEnd)) &&
      (isAfter(end, monthStart) || isEqual(end, monthStart));
  }).length;
}


