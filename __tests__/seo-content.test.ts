import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  assessmentEvents,
  describeRange,
  formatCompactDate,
  formatLongDate,
  formatLongDateWithWeekday,
  formatMonthHeading,
  groupEventsByType,
  groupHolidaysByMonth,
  toEventRows,
  toHolidayRows
} from "@/lib/calendar-content";
import { ipuCalendarFeed } from "@/lib/data/ipu-calendar";
import { absoluteUrl, siteConfig, siteHost } from "@/lib/site";
import { getRoute, seoRoutes } from "@/lib/seo-routes";
import {
  eventListSchema,
  holidayListSchema,
  schemaGraph,
  semesterCourseSchema,
  webPageSchema,
  webSiteSchema
} from "@/lib/structured-data";

const feed = ipuCalendarFeed;

describe("calendar content formatters", () => {
  it("formats dates without shifting the day", () => {
    // These keys are date-only; a formatter that re-projects them into another
    // timezone could report a day earlier than the calendar grid shows.
    assert.equal(formatLongDate("2026-08-03"), "3 August 2026");
    assert.equal(formatCompactDate("2026-08-03"), "3 Aug 2026");
    assert.equal(formatMonthHeading("2026-08-03"), "August 2026");
  });

  it("includes the weekday for single-day descriptions", () => {
    assert.equal(
      formatLongDateWithWeekday("2026-08-03"),
      "Monday, 3 August 2026"
    );
    assert.equal(
      describeRange("2026-08-03", "2026-08-03"),
      "Monday, 3 August 2026"
    );
  });

  it("describes a multi-day range without a weekday prefix", () => {
    assert.equal(
      describeRange("2026-08-03", "2027-01-17"),
      "3 August 2026 to 17 January 2027"
    );
  });
});

describe("holiday rows", () => {
  const rows = toHolidayRows(feed.holidays);

  it("sorts holidays chronologically", () => {
    const dates = rows.map((row) => row.date);
    assert.deepEqual(dates, [...dates].sort());
  });

  it("marks weekend holidays so they can be excluded from the grid", () => {
    for (const row of rows) {
      assert.equal(row.fallsOnWeekend, [0, 6].includes(new Date(row.date).getDay()));
    }
  });

  it("only invents a description when the feed omits one", () => {
    const withoutDescription = rows.filter((row) => !row.description);
    assert.ok(withoutDescription.length > 0, "fixture should cover this branch");
    assert.equal(
      withoutDescription.every((row) => row.description === undefined),
      true
    );
  });

  it("groups holidays by month and year", () => {
    const groups = groupHolidaysByMonth(rows);

    assert.ok(groups.length > 0);
    assert.equal(
      groups.reduce((total, group) => total + group.entries.length, 0),
      rows.length
    );
    assert.equal(
      groups.every((group) => /^[A-Z][a-z]+ \d{4}$/.test(group.month)),
      true
    );
  });
});

describe("event rows", () => {
  it("counts an inclusive day span", () => {
    const [exam] = toEventRows(
      feed.events.filter((event) => event.id === "odd-2026-27-term-end-theory")
    );

    // 11 Dec 2026 through 3 Jan 2027, both ends included.
    assert.equal(exam.startDate, "2026-12-11");
    assert.equal(exam.endDate, "2027-01-03");
    assert.equal(exam.duration, "24 days");
  });

  it("labels a single-day event as 1 day", () => {
    const single = toEventRows(feed.events).filter((row) => row.duration === "1 day");
    assert.ok(single.length > 0, "fixture should contain a one-day event");
  });

  it("keeps exam and deadline events for assessment queries", () => {
    const assessments = assessmentEvents(feed);

    assert.ok(assessments.length > 0);
    assert.equal(
      assessments.every(
        (event) => event.type === "exam" || event.type === "deadline"
      ),
      true
    );
  });

  it("scopes assessments to one semester when asked", () => {
    const odd = assessmentEvents(feed, "odd-2026-27");

    assert.ok(odd.length > 0);
    assert.equal(odd.every((event) => event.semesterId === "odd-2026-27"), true);
    assert.equal(assessmentEvents(feed).length >= odd.length, true);
  });

  it("groups events by type and omits empty groups", () => {
    const groups = groupEventsByType(feed, "odd-2026-27");

    assert.ok(groups.length > 0);
    assert.equal(groups.every((group) => group.events.length > 0), true);
    assert.equal(
      groups.every((group) => group.events.every((row) => row.type === group.type)),
      true
    );
  });
});

describe("site configuration", () => {
  it("builds absolute URLs from the resolved origin", () => {
    assert.equal(absoluteUrl("/usar-holiday-list"), `${siteConfig.origin}/usar-holiday-list`);
  });

  it("exposes a bare host for the robots Host directive", () => {
    assert.equal(siteHost(), new URL(siteConfig.origin).host);
    assert.equal(siteHost().includes("/"), false);
    assert.equal(siteHost().includes("http"), false);
  });

  it("resolves an https origin in production", () => {
    assert.match(siteConfig.origin, /^https?:\/\//);
  });
});

describe("seo routes", () => {
  it("has no query strings in indexable paths", () => {
    assert.equal(seoRoutes.every((route) => !route.path.includes("?")), true);
  });

  it("builds absolute URLs", () => {
    assert.equal(
      seoRoutes.every((route) => route.url.startsWith(siteConfig.origin)),
      true
    );
  });

  it("includes the home page exactly once", () => {
    assert.equal(seoRoutes.filter((route) => route.path === "/").length, 1);
  });

  it("throws instead of silently canonicalising an unknown path", () => {
    assert.throws(() => getRoute("/does-not-exist"), /Unknown SEO route/);
  });
});

describe("structured data", () => {
  it("strips @context from graph members", () => {
    const graph = schemaGraph(webPageSchema({
      path: "/",
      name: "Home",
      description: "Test",
      breadcrumb: [{ name: "Home", path: "/" }]
    }));

    assert.equal(graph["@context"], "https://schema.org");
    assert.ok(graph["@graph"].length > 0);
    assert.equal(
      graph["@graph"].every((node) => !("@context" in (node as object))),
      true
    );
  });

  it("drops null members instead of emitting empty nodes", () => {
    const graph = schemaGraph(null, webSiteSchema(), null);

    assert.equal(graph["@graph"].length, 1);
  });

  it("gives each event an id, dates and an organizer", () => {
    const list = eventListSchema(assessmentEvents(feed), {
      name: "Exams",
      path: "/ipu-academic-calendar"
    });

    assert.equal(list.numberOfItems, assessmentEvents(feed).length);
    for (const entry of list.itemListElement) {
      assert.equal(entry.item["@type"], "Event");
      assert.ok(entry.item["@id"].includes("#"));
      assert.ok(entry.item.startDate);
      assert.ok(entry.item.organizer);
      assert.match(entry.item.eventStatus, /EventScheduled$/);
    }
  });

  it("returns null when there is nothing to describe", () => {
    assert.equal(eventListSchema([], { name: "Empty", path: "/" }), null);
    assert.equal(holidayListSchema([], { name: "Empty", path: "/" }), null);
  });

  it("describes every holiday without inventing an observance claim", () => {
    const list = holidayListSchema(feed.holidays, {
      name: "Holidays",
      path: "/usar-holiday-list"
    });

    assert.equal(list.numberOfItems, feed.holidays.length);

    for (const entry of list.itemListElement) {
      const description: string = entry.item.description;
      const holiday = feed.holidays.find(
        (candidate) => candidate.id === entry.item["@id"].split("#")[1]
      );

      assert.ok(holiday, "every schema entry maps to a real holiday");
      if (!holiday.description) {
        assert.equal(
          description.includes("observed by"),
          false,
          `must not claim observance for ${holiday.name}`
        );
      }
    }
  });

  it("describes each semester with human-readable dates", () => {
    const list = semesterCourseSchema(feed);

    assert.equal(list.numberOfItems, feed.semesters.length);

    for (const entry of list.itemListElement) {
      const semester = feed.semesters[entry.position - 1];
      assert.equal(entry.item.startDate, semester.startDate);
      assert.equal(
        /\d{4}-\d{2}-\d{2}/.test(entry.item.description),
        false,
        "description should not leak raw ISO keys"
      );
    }
  });
});
