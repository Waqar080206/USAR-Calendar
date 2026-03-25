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
  Holiday,
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

export const eventTypeMeta: Record<
  CalendarEventType,
  {
    label: string;
    chipClass: string;
    surfaceClass: string;
    dotClass: string;
  }
> = {
  registration: {
    label: "Registration",
    chipClass: "bg-emerald-100 text-emerald-800",
    surfaceClass: "bg-emerald-50/80 text-emerald-900",
    dotClass: "bg-emerald-500"
  },
  class: {
    label: "Class",
    chipClass: "bg-sky-100 text-sky-800",
    surfaceClass: "bg-sky-50/80 text-sky-900",
    dotClass: "bg-sky-500"
  },
  exam: {
    label: "Exam",
    chipClass: "bg-rose-100 text-rose-800",
    surfaceClass: "bg-rose-50/80 text-rose-900",
    dotClass: "bg-rose-500"
  },
  holiday: {
    label: "Holiday",
    chipClass: "bg-amber-100 text-amber-800",
    surfaceClass: "bg-amber-50/80 text-amber-900",
    dotClass: "bg-amber-500"
  },
  break: {
    label: "Break",
    chipClass: "bg-violet-100 text-violet-800",
    surfaceClass: "bg-violet-50/80 text-violet-900",
    dotClass: "bg-violet-500"
  },
  deadline: {
    label: "Deadline",
    chipClass: "bg-orange-100 text-orange-800",
    surfaceClass: "bg-orange-50/80 text-orange-900",
    dotClass: "bg-orange-500"
  },
  notice: {
    label: "Notice",
    chipClass: "bg-slate-200 text-slate-800",
    surfaceClass: "bg-slate-100 text-slate-900",
    dotClass: "bg-slate-500"
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

export function getCalendarItems(feed: CalendarFeed) {
  return [
    ...feed.events.map((event) => ({
      ...event,
      sourceType: "event" as const
    })),
    ...feed.holidays.map(holidayToItem)
  ].sort(compareItems);
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
  feed: CalendarFeed,
  todayKey: string
): SemesterStats {
  const semesterStart = parseDateKey(feed.semester.startDate);
  const semesterEnd = parseDateKey(feed.semester.endDate);
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

  const holidayDateSet = new Set(
    feed.holidays
      .map((holiday) => holiday.date)
      .filter((holidayDate) => {
        const date = parseDateKey(holidayDate);
        return (
          (isAfter(date, semesterStart) || isEqual(date, semesterStart)) &&
          (isBefore(date, semesterEnd) || isEqual(date, semesterEnd))
        );
      })
  );

  const holidaysRemaining = feed.holidays.filter((holiday) => {
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
          feed.semester.workingWeekdays.includes(weekday) &&
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
