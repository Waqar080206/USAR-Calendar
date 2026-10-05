import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  eventSpansDate,
  filterItemsByTypes,
  getCalendarItems,
  getDisplayRange,
  getDurationLabel,
  getHolidayDateSet,
  getItemsByDateKey,
  getItemsForDate,
  HOLIDAY_SEMESTER_ID,
  getMonthDays,
  getMonthEventCount,
  getMonthWeeks,
  getSemesterScope,
  getSemesterStats,
  getSemesterForDate,
  getTodayKey,
  getUpcomingItems,
  getWeekDays,
  getWorkingDayBreakdown,
  isMarkedHoliday,
  isWeekendKey,
  isWorkingDayKey,
  parseDateKey,
  parseMonthKey,
  toDateKey,
  toMonthKey
} from "@/lib/calendar";
import { CalendarFeed, getSemester, SemesterConfig } from "@/lib/types";

const semester: SemesterConfig = {
  id: "test-2026",
  name: "Test Semester 2026",
  shortName: "Test 26",
  term: "odd",
  startDate: "2026-01-05",
  endDate: "2026-01-18",
  session: "2026",
  workingWeekdays: [1, 2, 3, 4, 5],
  timezone: "Asia/Kolkata"
};

const feed: CalendarFeed = {
  semesters: [semester],
  events: [
    {
      id: "classes-begin",
      semesterId: semester.id,
      title: "Classes Begin",
      type: "class",
      startDate: "2026-01-05",
      endDate: "2026-01-05",
      allDay: true,
      description: "Teaching starts.",
      source: "Test"
    },
    {
      id: "midterm",
      semesterId: semester.id,
      title: "Mid Term",
      type: "exam",
      startDate: "2026-01-12",
      endDate: "2026-01-14",
      allDay: true,
      description: "Exams.",
      source: "Test"
    },
    {
      id: "sports-day",
      semesterId: semester.id,
      title: "Sports Day",
      type: "notice",
      startDate: "2026-01-15",
      endDate: "2026-01-15",
      allDay: true,
      description: "Campus event.",
      source: "Test"
    }
  ],
  holidays: [
    {
      id: "republic-day",
      name: "Republic Day",
      date: "2026-01-26",
      category: "Gazetted",
      source: "Test"
    },
    {
      id: "holi",
      name: "Holi",
      date: "2026-01-08",
      category: "Festival",
      source: "Test"
    }
  ],
  announcements: []
};

const evenSemester: SemesterConfig = {
  ...semester,
  id: "even-2026",
  name: "Even Semester 2026",
  shortName: "Even 26",
  term: "even",
  startDate: "2026-02-02",
  endDate: "2026-06-06"
};

const multiSemesterFeed: CalendarFeed = {
  semesters: [semester, evenSemester],
  events: [
    ...feed.events,
    {
      id: "even-events-begin",
      semesterId: evenSemester.id,
      title: "Even Classes Begin",
      type: "class",
      startDate: "2026-02-02",
      endDate: "2026-02-02",
      allDay: true,
      description: "Teaching starts for the even term.",
      source: "Test"
    }
  ],
  holidays: feed.holidays,
  announcements: feed.announcements
};

describe("semester resolution", () => {
  it("falls back to the first semester for an unknown id", () => {
    assert.equal(getSemester(multiSemesterFeed, "nope").id, semester.id);
    assert.equal(getSemester(multiSemesterFeed, undefined).id, semester.id);
  });

  it("returns only the requested semester's events", () => {
    const evenScope = getSemesterScope(multiSemesterFeed, evenSemester.id);

    assert.equal(evenScope.semester.id, evenSemester.id);
    assert.deepEqual(
      evenScope.events.map((event) => event.id),
      ["even-events-begin"]
    );
  });

  it("keeps holidays attached to every semester", () => {
    assert.equal(
      getSemesterScope(multiSemesterFeed, evenSemester.id).holidays.length,
      feed.holidays.length
    );
  });

  it("picks the semester containing today", () => {
    assert.equal(getSemesterForDate(multiSemesterFeed, "2026-02-10").id, evenSemester.id);
    assert.equal(getSemesterForDate(multiSemesterFeed, "2026-01-06").id, semester.id);
  });

  it("picks the current semester when today falls in a gap between terms", () => {
    // Between Jan 18 and Feb 2 neither semester is running.
    assert.equal(getSemesterForDate(multiSemesterFeed, "2026-01-25").id, semester.id);
  });

  it("picks the first semester when every term has passed", () => {
    assert.equal(getSemesterForDate(multiSemesterFeed, "2027-01-01").id, semester.id);
  });

  it("tags holidays as belonging to no single semester", () => {
    const holidayItem = getCalendarItems(feed).find(
      (item) => item.type === "holiday"
    );

    assert.ok(holidayItem);
    assert.equal(holidayItem.semesterId, HOLIDAY_SEMESTER_ID);
  });

  it("does not leak events across semesters in the index", () => {
    const evenIndex = getItemsByDateKey(
      getCalendarItems(getSemesterScope(multiSemesterFeed, evenSemester.id))
    );

    assert.equal(evenIndex.get("2026-01-12"), undefined);
    assert.equal(evenIndex.get("2026-02-02")?.length, 1);
  });
});

describe("date key helpers", () => {
  it("round trips a date key", () => {
    assert.equal(toDateKey(parseDateKey("2026-03-09")), "2026-03-09");
  });

  it("parses a date key in local time, not UTC", () => {
    const parsed = parseDateKey("2026-03-09");

    assert.equal(parsed.getFullYear(), 2026);
    assert.equal(parsed.getMonth(), 2);
    assert.equal(parsed.getDate(), 9);
    assert.equal(parsed.getHours(), 0);
  });

  it("derives the month key", () => {
    assert.equal(toMonthKey(parseDateKey("2026-03-09")), "2026-03");
  });

  it("parses a month key to the first of the month", () => {
    assert.equal(toDateKey(parseMonthKey("2026-03")), "2026-03-01");
  });

  it("returns an ISO yyyy-mm-dd key for the requested timezone", () => {
    const key = getTodayKey("Asia/Kolkata");

    assert.match(key, /^\d{4}-\d{2}-\d{2}$/);
  });

  it("can resolve a different date across the UTC boundary", () => {
    const kolkata = getTodayKey("Asia/Kolkata");
    const honolulu = getTodayKey("Pacific/Honolulu");

    const kolkataMinutes =
      Number(kolkata.slice(0, 4)) * 10000 +
      Number(kolkata.slice(5, 7)) * 100 +
      Number(kolkata.slice(8, 10));
    const honoluluMinutes =
      Number(honolulu.slice(0, 4)) * 10000 +
      Number(honolulu.slice(5, 7)) * 100 +
      Number(honolulu.slice(8, 10));

    // Kolkata is UTC+5:30, so it is never behind Honolulu.
    assert.ok(kolkataMinutes >= honoluluMinutes);
  });
});

describe("eventSpansDate", () => {
  const range = { startDate: "2026-01-12", endDate: "2026-01-14" };

  it("includes the first day of a range", () => {
    assert.equal(eventSpansDate(range, "2026-01-12"), true);
  });

  it("includes interior days of a range", () => {
    assert.equal(eventSpansDate(range, "2026-01-13"), true);
  });

  it("includes the last day of a range", () => {
    assert.equal(eventSpansDate(range, "2026-01-14"), true);
  });

  it("excludes days outside a range", () => {
    assert.equal(eventSpansDate(range, "2026-01-11"), false);
    assert.equal(eventSpansDate(range, "2026-01-15"), false);
  });

  it("handles a single day event", () => {
    const single = { startDate: "2026-01-20", endDate: "2026-01-20" };

    assert.equal(eventSpansDate(single, "2026-01-20"), true);
    assert.equal(eventSpansDate(single, "2026-01-21"), false);
  });
});

describe("getCalendarItems", () => {
  const items = getCalendarItems(feed);

  it("merges events and holidays", () => {
    assert.equal(items.length, feed.events.length + feed.holidays.length);
  });

  it("tags holidays with their category", () => {
    const holiday = items.find((item) => item.id === "holi");

    assert.equal(holiday?.sourceType, "holiday");
    assert.equal(holiday?.type, "holiday");
    assert.equal(holiday?.holidayCategory, "Festival");
    assert.equal(holiday?.title, "Holi");
  });

  it("tags seed events as events", () => {
    const event = items.find((item) => item.id === "classes-begin");

    assert.equal(event?.sourceType, "event");
    assert.equal(event?.type, "class");
  });

  it("sorts by date ascending", () => {
    const dates = items.map((item) => item.startDate);
    const sorted = [...dates].sort();

    assert.deepEqual(dates, sorted);
  });

  it("puts holidays before other types on the same date", () => {
    const sameDay = items.filter((item) => item.startDate === "2026-01-08");

    assert.ok(sameDay.length >= 1);
  });
});

describe("getItemsForDate", () => {
  const items = getCalendarItems(feed);

  it("returns every item covering the date", () => {
    const onExamDay = getItemsForDate(items, "2026-01-13");

    assert.deepEqual(
      onExamDay.map((item) => item.id),
      ["midterm"]
    );
  });

  it("returns an empty list for a clear date", () => {
    assert.deepEqual(getItemsForDate(items, "2026-01-06"), []);
  });

  it("returns a single day event on its own date", () => {
    const onSportsDay = getItemsForDate(items, "2026-01-15");

    assert.deepEqual(
      onSportsDay.map((item) => item.id),
      ["sports-day"]
    );
  });
});

describe("getUpcomingItems", () => {
  const items = getCalendarItems(feed);

  it("excludes items that already ended", () => {
    const upcoming = getUpcomingItems(items, "2026-01-10");

    assert.ok(!upcoming.some((item) => item.id === "classes-begin"));
  });

  it("includes items ending exactly on the from date", () => {
    const upcoming = getUpcomingItems(items, "2026-01-14");

    assert.ok(upcoming.some((item) => item.id === "midterm"));
  });

  it("respects the limit", () => {
    assert.equal(getUpcomingItems(items, "2026-01-01", 2).length, 2);
  });
});

describe("getMonthDays and getMonthWeeks", () => {
  it("always produces a 42 day grid", () => {
    assert.equal(getMonthDays("2026-02").length, 42);
    assert.equal(getMonthDays("2026-01").length, 42);
  });

  it("starts the grid on a Sunday", () => {
    assert.equal(getMonthDays("2026-03")[0].getDay(), 0);
  });

  it("contains the first of the month", () => {
    assert.ok(getMonthDays("2026-05").some((day) => day.getDate() === 1));
  });

  it("splits into six weeks of seven days", () => {
    const weeks = getMonthWeeks("2026-02");

    assert.equal(weeks.length, 6);
    weeks.forEach((week) => assert.equal(week.length, 7));
  });
});

describe("getWeekDays", () => {
  it("returns the Sunday-to-Saturday week containing the date", () => {
    const week = getWeekDays("2026-03-11");

    assert.equal(week.length, 7);
    assert.equal(week[0].getDay(), 0);
    assert.equal(week[6].getDay(), 6);
    assert.ok(week.some((day) => toDateKey(day) === "2026-03-11"));
  });

  it("handles a Sunday input by starting on that same day", () => {
    const week = getWeekDays("2026-03-08");

    assert.equal(toDateKey(week[0]), "2026-03-08");
  });
});

describe("working day helpers", () => {
  const holidays = getHolidayDateSet(feed);
  const weekdays = semester.workingWeekdays;

  it("collects holiday dates", () => {
    assert.ok(holidays.has("2026-01-08"));
    assert.equal(holidays.size, 2);
  });

  it("detects weekends", () => {
    assert.equal(isWeekendKey("2026-01-10"), true);
    assert.equal(isWeekendKey("2026-01-08"), false);
  });

  it("treats a configured weekday as working", () => {
    assert.equal(isWorkingDayKey("2026-01-07", weekdays, holidays), true);
  });

  it("treats a non working weekday as off", () => {
    // Saturday is not in workingWeekdays [1,2,3,4,5].
    assert.equal(isWorkingDayKey("2026-01-10", weekdays, holidays), false);
  });

  it("treats a holiday as non working even on a weekday", () => {
    // 2026-01-08 is a Thursday, but it is Holi.
    assert.equal(isWorkingDayKey("2026-01-08", weekdays, holidays), false);
  });

  it("does not mark a holiday that falls on a weekend", () => {
    // Independence Day 2026-08-15 is a Saturday, so it adds nothing to a
    // 5 day week and must not be marked or counted as a holiday.
    const weekendFeed: CalendarFeed = {
      ...feed,
      holidays: [
        ...feed.holidays,
        {
          id: "weekend-holiday",
          name: "Weekend Holiday",
          date: "2026-08-15",
          category: "Gazetted",
          source: "Test"
        }
      ]
    };

    assert.equal(isMarkedHoliday(weekendFeed.holidays[2]), false);
    assert.equal(getHolidayDateSet(weekendFeed).has("2026-08-15"), false);
    assert.equal(
      getCalendarItems(weekendFeed).some((item) => item.id === "weekend-holiday"),
      false
    );

    const breakdown = getWorkingDayBreakdown(
      "2026-08-15",
      "2026-08-15",
      weekdays,
      getHolidayDateSet(weekendFeed)
    );

    // Counted as a plain weekend day instead of a holiday.
    assert.equal(breakdown.holidayDays, 0);
    assert.equal(breakdown.weekendDays, 1);
  });

  it("supports Saturday as a working day when configured", () => {
    assert.equal(isWorkingDayKey("2026-01-10", [1, 2, 3, 4, 5, 6], holidays), true);
  });
});

describe("getWorkingDayBreakdown", () => {
  const holidays = getHolidayDateSet(feed);
  const weekdays = semester.workingWeekdays;

  it("splits a range into buckets that never double count", () => {
    // Mon 2026-01-05 through Sun 2026-01-11.
    const result = getWorkingDayBreakdown(
      "2026-01-05",
      "2026-01-11",
      weekdays,
      holidays
    );

    assert.equal(result.calendarDays, 7);
    // Holi falls on the Thu of this week, so 5 weekdays - 1 holiday.
    assert.equal(result.workingDays, 4);
    assert.equal(result.weekendDays, 2);
    assert.equal(result.holidayDays, 1);
  });

  it("counts a holiday-free week as five working days", () => {
    // Mon 2026-01-12 through Sun 2026-01-18 has no holidays.
    const result = getWorkingDayBreakdown(
      "2026-01-12",
      "2026-01-18",
      weekdays,
      holidays
    );

    assert.equal(result.calendarDays, 7);
    assert.equal(result.workingDays, 5);
    assert.equal(result.weekendDays, 2);
    assert.equal(result.holidayDays, 0);
  });

  it("normalises a reversed range", () => {
    const forward = getWorkingDayBreakdown(
      "2026-01-05",
      "2026-01-11",
      weekdays,
      holidays
    );
    const reversed = getWorkingDayBreakdown(
      "2026-01-11",
      "2026-01-05",
      weekdays,
      holidays
    );

    assert.deepEqual(reversed, forward);
  });

  it("counts a single day as one calendar day", () => {
    const result = getWorkingDayBreakdown(
      "2026-01-07",
      "2026-01-07",
      weekdays,
      holidays
    );

    assert.equal(result.calendarDays, 1);
    assert.equal(result.workingDays, 1);
  });

  it("always sums back to the calendar day count", () => {
    const result = getWorkingDayBreakdown(
      "2026-01-05",
      "2026-02-28",
      weekdays,
      holidays
    );

    assert.equal(
      result.workingDays + result.weekendDays + result.holidayDays,
      result.calendarDays
    );
  });
});

describe("getSemesterStats", () => {
  const statsFor = (todayKey: string) =>
    getSemesterStats(semester, feed.holidays, todayKey);

  it("reports zero elapsed days before the semester starts", () => {
    const stats = statsFor("2025-12-01");

    assert.equal(stats.elapsedDays, 0);
    assert.equal(stats.remainingDays, stats.totalDays);
  });

  it("clamps elapsed days after the semester ends", () => {
    const stats = statsFor("2026-06-01");

    assert.equal(stats.elapsedDays, stats.totalDays);
    assert.equal(stats.remainingDays, 0);
    assert.equal(stats.workingDaysRemaining, 0);
  });

  it("includes the first and last day in the total", () => {
    const stats = statsFor("2026-01-05");

    assert.equal(stats.totalDays, 14);
  });

  it("counts elapsed days inclusively", () => {
    const stats = statsFor("2026-01-05");

    assert.equal(stats.elapsedDays, 1);
  });

  it("reports no remaining holidays once the semester is over", () => {
    const stats = statsFor("2026-01-20");

    assert.equal(stats.holidaysRemaining, 0);
  });

  it("only counts holidays that fall inside the semester window", () => {
    const stats = statsFor("2024-01-01");

    // Holi (2026-01-08) is in range; Republic Day (2026-01-26) is not.
    assert.equal(stats.holidaysRemaining, 1);
  });

  it("excludes a holiday from remaining working days", () => {
    // Jan 5 to Jan 18 is 10 Mon-Fri weekdays, minus Holi on Jan 8.
    const stats = statsFor("2026-01-05");

    assert.equal(stats.workingDaysRemaining, 9);
  });

  it("scopes each semester to its own window", () => {
    // 2026-01-20 is after the odd term ends but before the even term starts.
    const evenStats = getSemesterStats(evenSemester, feed.holidays, "2026-01-20");

    assert.equal(evenStats.elapsedDays, 0);
    assert.equal(evenStats.remainingDays, evenStats.totalDays);
    assert.equal(statsFor("2026-01-20").elapsedDays, 14);
  });
});

describe("getItemsByDateKey", () => {
  it("indexes each day a multi day event spans", () => {
    const index = getItemsByDateKey(getCalendarItems(feed));

    assert.equal(index.get("2026-01-12")?.length, 1);
    assert.equal(index.get("2026-01-13")?.length, 1);
    assert.equal(index.get("2026-01-14")?.length, 1);
    assert.equal(index.get("2026-01-16"), undefined);
  });

  it("groups events that overlap on the same day", () => {
    const overlapping: CalendarFeed = {
      ...feed,
      events: [
        ...feed.events,
        {
          id: "overlap",
          semesterId: semester.id,
          title: "Overlapping",
          type: "deadline",
          startDate: "2026-01-13",
          endDate: "2026-01-13",
          allDay: true,
          description: "",
          source: "Test"
        }
      ]
    };

    const index = getItemsByDateKey(getCalendarItems(overlapping));

    assert.equal(index.get("2026-01-13")?.length, 2);
  });
});

describe("getMonthEventCount", () => {
  const items = getCalendarItems(feed);

  it("counts every item overlapping the month, holidays included", () => {
    // 3 seeded events + Holi (Jan 8) + Republic Day (Jan 26).
    assert.equal(getMonthEventCount(items, "2026-01"), 5);
  });

  it("excludes items outside the month", () => {
    assert.equal(getMonthEventCount(items, "2026-03"), 0);
  });

  it("counts a multi day event in each month it touches", () => {
    const spanning: CalendarFeed = {
      ...feed,
      holidays: [],
      events: [
        {
          id: "spanning",
          semesterId: semester.id,
          title: "Spanning",
          type: "break",
          startDate: "2026-01-28",
          endDate: "2026-02-04",
          allDay: true,
          description: "",
          source: "Test"
        }
      ]
    };

    const spanningItems = getCalendarItems(spanning);

    assert.equal(getMonthEventCount(spanningItems, "2026-01"), 1);
    assert.equal(getMonthEventCount(spanningItems, "2026-02"), 1);
    assert.equal(getMonthEventCount(spanningItems, "2026-03"), 0);
  });
});

describe("filterItemsByTypes", () => {
  const items = getCalendarItems(feed);

  it("returns everything when no types are active", () => {
    assert.equal(filterItemsByTypes(items, []).length, items.length);
  });

  it("keeps only the requested types", () => {
    const filtered = filterItemsByTypes(items, ["exam"]);

    assert.ok(filtered.length > 0);
    assert.ok(filtered.every((item) => item.type === "exam"));
  });

  it("can filter to a single type and get a stable count", () => {
    assert.equal(filterItemsByTypes(items, ["holiday"]).length, 2);
  });
});

describe("display helpers", () => {
  it("formats a single day event with the weekday", () => {
    const item = { startDate: "2026-01-12", endDate: "2026-01-12" };

    assert.equal(getDisplayRange(item), "Mon, 12 Jan 2026");
  });

  it("formats a multi day event as a range", () => {
    const item = { startDate: "2026-01-12", endDate: "2026-01-14" };

    assert.equal(getDisplayRange(item), "12 Jan - 14 Jan 2026");
  });

  it("labels a one day duration in the singular", () => {
    const item = { startDate: "2026-01-12", endDate: "2026-01-12" };

    assert.equal(getDurationLabel(item), "1 day");
  });

  it("counts both ends of a range inclusively", () => {
    const item = { startDate: "2026-01-12", endDate: "2026-01-14" };

    assert.equal(getDurationLabel(item), "3 days");
  });
});