import type { Metadata } from "next";

import { JsonLd } from "@/components/json-ld";
import { PageLinks, SeoPageShell } from "@/components/seo/seo-page";
import {
  CalendarCta,
  FaqSection,
  HolidayTable,
  MonthIndex,
  Prose,
  Section
} from "@/components/seo/calendar-content";
import {
  formatLongDate,
  groupHolidaysByMonth,
  toHolidayRows
} from "@/lib/calendar-content";
import { ipuCalendarFeed } from "@/lib/data/ipu-calendar";
import { buildPageMetadata } from "@/lib/metadata";
import {
  faqSchema,
  holidayListSchema,
  schemaGraph,
  webPageSchema
} from "@/lib/structured-data";

const PATH = "/usar-holiday-list";

export const metadata: Metadata = buildPageMetadata({
  title: "GGSIPU Holiday List 2026-27 | USAR & IPU Gazetted Holidays",
  description:
    "GGSIPU holiday list for 2026-27: every gazetted and festival holiday with dates, weekdays and weekend notes, for USAR and IPU students.",
  path: PATH
});

const faqs = [
  {
    question: "What is the GGSIPU holiday list for 2026-27?",
    answer:
      "The list covers 10 declared holidays from Independence Day on 15 August 2026 through Independence Day on 15 August 2027. The dates are taken from the university holiday notification and are the same for USAR and other IPU schools."
  },
  {
    question: "Why are some festival holidays missing for 2027?",
    answer:
      "Lunar festival dates such as Holi, Ram Navami, Janmashtami, Eid and Dussehra depend on the gazetted notification, which is not published for 2027 yet. Rather than guess, only the two fixed-date national holidays are listed for 2027. Add the festival dates once the university issues its notification."
  },
  {
    question: "What happens when a holiday falls on a Sunday?",
    answer:
      "Nothing changes at the university level: a Sunday is already a non-working day, so the calendar does not mark it as an additional holiday. The list flags these dates so you can see they were declared but that no extra day is granted."
  },
  {
    question: "Is this the official IPU holiday notification?",
    answer:
      "No. This is an independent, student-built list republished from the university notification for convenience. Confirm against the official notification, especially for 2027, where festival dates are still pending."
  }
];

export default function UsarHolidayListPage() {
  const feed = ipuCalendarFeed;
  const rows = toHolidayRows(feed.holidays);

  const gazetted = rows.filter((row) => row.category.startsWith("Gazetted"));
  const festival = rows.filter((row) => !row.category.startsWith("Gazetted"));
  const weekendHolidays = rows.filter((row) => row.fallsOnWeekend);

  const monthGroups = groupHolidaysByMonth(rows);

  const schema = schemaGraph(
    webPageSchema({
      path: PATH,
      name: "GGSIPU Holiday List 2026-27",
      description:
        "GGSIPU holiday list for 2026-27 with gazetted and festival holidays, dates, weekdays and weekend notes.",
      breadcrumb: [
        { name: "GGSIPU Academic Calendar 2026-27", path: "/" },
        { name: "USAR Holiday List", path: PATH }
      ]
    }),
    holidayListSchema(feed.holidays, {
      name: "GGSIPU holiday list 2026-27",
      path: PATH
    }),
    faqSchema(faqs)
  );

  return (
    <>
      <JsonLd data={schema} />

      <SeoPageShell
        currentPath={PATH}
        eyebrow="Holidays"
        heading="GGSIPU Holiday List 2026-27"
        intro={
          <>
            <p>
              Every holiday declared for the 2026-27 session, with the exact
              date and the weekday it falls on. There are{" "}
              {rows.length} holidays in total: {gazetted.length} gazetted national
              holidays and {festival.length} festival holidays, running from{" "}
              {formatLongDate(rows[0].date)} to{" "}
              {formatLongDate(rows[rows.length - 1].date)}.
            </p>
            <p>
              This list applies to USAR and the other IPU schools, since the
              holidays come from the university notification rather than from
              any single institution.
            </p>
          </>
        }
      >
        <Section
          id="holiday-list"
          heading="Holidays 2026-27 with Dates"
          intro="Gazetted holidays first, then festival holidays. Dates that fall on a weekend are noted, since they do not add an extra day off."
        >
          <HolidayTable rows={rows} caption="GGSIPU holiday list 2026-27" />
        </Section>

        <Prose>
          <p>
            {weekendHolidays.length} of these{" "}
            {weekendHolidays.length === 1 ? "holiday falls" : "holidays fall"} on
            a weekend ({weekendHolidays.map((row) => formatLongDate(row.date)).join(", ")})
            and {weekendHolidays.length === 1 ? "is" : "are"} not marked on the
            interactive calendar, since those days are already non-working.
          </p>
        </Prose>

        <MonthIndex
          heading="Holidays by month"
          groups={monthGroups}
        />

        <Section
          id="2027-holidays"
          heading="2027 Holidays: What Is Confirmed"
          intro="Only the fixed-date national holidays are confirmed for 2027. Lunar festival dates are gazetted annually and are listed once published."
        >
          <HolidayTable
            rows={rows.filter((row) => row.date.startsWith("2027"))}
            caption="Confirmed 2027 holidays"
          />
          <Prose>
            <p>
              15 August 2027 (Sunday) and 26 January 2027 (Tuesday) are fixed by
              statute and are safe to plan around. Festival holidays for 2027 are
              not published, so they are deliberately excluded rather than
              estimated. If you need them now, check the university holiday
              notification directly.
            </p>
          </Prose>
        </Section>

        <CalendarCta />

        <FaqSection heading="Holiday list FAQs" entries={faqs} />

        <PageLinks
          links={[
            {
              href: "/ggsipu-academic-calendar",
              title: "GGSIPU Academic Calendar",
              description:
                "Semester and examination dates alongside this holiday list."
            },
            {
              href: "/ipu-academic-calendar",
              title: "IPU Academic Calendar",
              description: "The full IPU session in date order."
            },
            {
              href: "/usar-academic-calendar",
              title: "USAR Academic Calendar",
              description: "USAR-specific campus events and deadlines."
            }
          ]}
        />
      </SeoPageShell>
    </>
  );
}
