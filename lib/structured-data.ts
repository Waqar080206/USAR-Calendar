/**
 * Schema.org builders.
 *
 * Everything here is derived from the real calendar feed, so a structured-data
 * block can never claim a date the calendar itself does not show. Dates are
 * emitted in ISO 8601 (`YYYY-MM-DD` / `YYYY-MM-DD/YYYY-MM-DD`) which Schema.org
 * accepts directly.
 */

import { CalendarEvent, CalendarFeed, Holiday } from "@/lib/types";
import { describeRange } from "@/lib/calendar-content";
import { siteConfig } from "@/lib/site";

const ORGANIZATION = {
  "@type": "EducationalOrganization",
  name: "University School of Automobile Research (USAR)",
  parentOrganization: {
    "@type": "CollegeOrUniversity",
    name: "Guru Gobind Singh Indraprastha University (GGSIPU)"
  }
} as const;

export function webSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteConfig.origin}/#website`,
    url: `${siteConfig.origin}/`,
    name: siteConfig.name,
    description:
      "Interactive GGSIPU academic calendar 2026-27 with semester dates, examinations, holidays and academic events for IPU and USAR students.",
    inLanguage: siteConfig.language,
    publisher: ORGANIZATION
  };
}

export function webPageSchema({
  path,
  name,
  description,
  breadcrumb
}: {
  path: string;
  name: string;
  description: string;
  breadcrumb: Array<{ name: string; path: string }>;
}) {
  const url = `${siteConfig.origin}${path === "/" ? "" : path}`;

  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url: url === siteConfig.origin ? `${url}/` : url,
    name,
    description,
    inLanguage: siteConfig.language,
    isPartOf: { "@id": `${siteConfig.origin}/#website` },
    breadcrumb: breadcrumbSchema(breadcrumb)
  };
}

export function breadcrumbSchema(
  items: Array<{ name: string; path: string }>
) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${siteConfig.origin}${item.path === "/" ? "" : item.path}`
    }))
  };
}

export function faqSchema(
  entries: Array<{ question: string; answer: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: entries.map((entry) => ({
      "@type": "Question",
      name: entry.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: entry.answer
      }
    }))
  };
}

function isoRange(event: CalendarEvent) {
  return event.startDate === event.endDate
    ? event.startDate
    : `${event.startDate}/${event.endDate}`;
}

/** Academic events as Schema.org `Event` nodes inside an ordered `ItemList`. */
export function eventListSchema(
  events: CalendarEvent[],
  { name, path }: { name: string; path: string }
) {
  if (events.length === 0) {
    return null;
  }

  return {
    "@type": "ItemList",
    "@id": `${siteConfig.origin}${path}#academic-events`,
    name,
    numberOfItems: events.length,
    itemListElement: events.map((event, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Event",
        "@id": `${siteConfig.origin}${path}#${event.id}`,
        name: event.title,
        startDate: event.startDate,
        endDate: event.endDate,
        // Date range shorthand is more precise for multi-day events.
        alternateDate: isoRange(event),
        eventStatus: "https://schema.org/EventScheduled",
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        isAccessibleForFree: true,
        description: event.description,
        organizer: ORGANIZATION,
        url: `${siteConfig.origin}${path}`
      }
    }))
  };
}

/** Gazetted and festival holidays as Schema.org `Event` nodes. */
export function holidayListSchema(
  holidays: Holiday[],
  { name, path }: { name: string; path: string }
) {
  if (holidays.length === 0) {
    return null;
  }

  const sorted = [...holidays].sort((left, right) =>
    left.date.localeCompare(right.date)
  );

  return {
    "@type": "ItemList",
    "@id": `${siteConfig.origin}${path}#holiday-list`,
    name,
    numberOfItems: sorted.length,
    itemListElement: sorted.map((holiday, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Event",
        "@id": `${siteConfig.origin}${path}#${holiday.id}`,
        name: holiday.name,
        startDate: holiday.date,
        eventStatus: "https://schema.org/EventScheduled",
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        isAccessibleForFree: true,
        // Never assert that the university observed a day unless the feed says
        // so; fall back to the published category instead.
        description: holiday.description ?? `${holiday.category}: ${holiday.name}.`,
        organizer: ORGANIZATION,
        url: `${siteConfig.origin}${path}`
      }
    }))
  };
}

/** Semester windows described as `Course` instances with known start/end dates. */
export function semesterCourseSchema(feed: CalendarFeed) {
  return {
    "@type": "ItemList",
    "@id": `${siteConfig.origin}/#semesters`,
    name: "GGSIPU semesters 2026-27",
    numberOfItems: feed.semesters.length,
    itemListElement: feed.semesters.map((semester, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Course",
        name: semester.name,
        description: `Semester schedule for ${semester.name}, running ${describeRange(
          semester.startDate,
          semester.endDate
        )}.`,
        startDate: semester.startDate,
        endDate: semester.endDate,
        inLanguage: siteConfig.language,
        provider: ORGANIZATION
      }
    }))
  };
}

/**
 * Wraps schema nodes in a single `@graph`. `@context` is stripped from the
 * members: once declared on the graph it must not be repeated, and duplicated
 * `@context` keys are invalid inside a JSON-LD graph.
 */
export function schemaGraph(...nodes: Array<unknown | null>) {
  return {
    "@context": "https://schema.org",
    "@graph": nodes.filter(Boolean).map(stripContext)
  };
}

function stripContext(node: unknown) {
  if (!node || typeof node !== "object" || Array.isArray(node)) {
    return node;
  }

  const { "@context": _context, ...rest } = node as Record<string, unknown>;
  return rest;
}
