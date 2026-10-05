import Link from "next/link";

import type { Metadata } from "next";

import { SimpleCalendar } from "@/components/simple-calendar";
import { JsonLd } from "@/components/json-ld";
import { SiteFooter, SiteNav } from "@/components/seo/site-chrome";
import {
  CalendarCta,
  EventTable,
  FaqSection,
  HolidayTable,
  Prose,
  RelatedLinks,
  SemesterSummaryTable,
  Section
} from "@/components/seo/calendar-content";
import { getTodayKey } from "@/lib/calendar";
import {
  assessmentEvents,
  describeRange,
  formatLongDate,
  toEventRows,
  toHolidayRows
} from "@/lib/calendar-content";
import { ipuCalendarFeed } from "@/lib/data/ipu-calendar";
import { buildPageMetadata } from "@/lib/metadata";
import { getRoute } from "@/lib/seo-routes";
import {
  faqSchema,
  schemaGraph,
  semesterCourseSchema,
  webPageSchema
} from "@/lib/structured-data";

export const metadata: Metadata = buildPageMetadata({
  title: "GGSIPU Academic Calendar 2026-27 | IPU Calendar",
  description:
    "Interactive GGSIPU academic calendar 2026-27 with semester dates, examinations, holidays and important academic events for IPU and USAR students.",
  path: "/"
});

const faqs = [
  {
    question: "What is the GGSIPU academic calendar for 2026-27?",
    answer:
      "The GGSIPU academic calendar for the 2026-27 session covers two semesters. The odd semester runs from 3 August 2026 to 17 January 2027 and the even semester runs from 18 January 2027 to 18 July 2027. Within each semester, instruction is followed by term-end examinations and then a vacation."
  },
  {
    question: "When do odd semester classes start at GGSIPU?",
    answer:
      "Classes for the odd semesters (first, third, fifth, seventh and ninth) commence on 3 August 2026. Teaching and continuous evaluation then run for 18 weeks on a five-day working week."
  },
  {
    question: "Are the 2027 festival holidays listed?",
    answer:
      "Only fixed-date national holidays are listed for 2027, which are Independence Day on 15 August 2027 and Republic Day on 26 January 2027. Lunar festival dates such as Holi, Ram Navami and Eid depend on the official gazetted notification, so they are left out rather than estimated. Check with the university before the notification is issued."
  },
  {
    question: "Is this the official GGSIPU website?",
    answer:
      "No. This is an independent, student-built calendar that republishes dates taken from the USAR academic calendar and IPU holiday notifications. It is not operated by Guru Gobind Singh Indraprastha University, so confirm any date against the official university notification before relying on it."
  },
  {
    question: "Can I share a specific date or event from the calendar?",
    answer:
      "Yes. The month, day, view and event are stored in the URL, so copying the address bar or using the share button gives someone a link that opens the calendar on exactly that date. Query strings are not separate pages, so the main calendar keeps a single canonical URL."
  }
];

type HomePageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default function HomePage({ searchParams }: HomePageProps) {
  const feed = ipuCalendarFeed;
  const route = getRoute("/");

  const semesterRows = feed.semesters.map((semester) => ({
    id: semester.id,
    name: semester.name,
    term: semester.term === "odd" ? "Odd" : "Even",
    window: describeRange(semester.startDate, semester.endDate)
  }));

  const holidayRows = toHolidayRows(feed.holidays);
  const assessmentRows = toEventRows(assessmentEvents(feed));
  const vacationRows = toEventRows(
    feed.events.filter((event) => event.type === "break")
  );
  const campusRows = toEventRows(
    feed.events.filter(
      (event) => event.type === "notice" || event.type === "deadline" || event.type === "class"
    )
  );

  const schema = schemaGraph(
    webPageSchema({
      path: "/",
      name: "GGSIPU Academic Calendar 2026-27 | IPU Calendar",
      description:
        "Interactive GGSIPU academic calendar 2026-27 with semester dates, examinations, holidays and important academic events for IPU and USAR students.",
      breadcrumb: [{ name: route.label, path: "/" }]
    }),
    semesterCourseSchema(feed),
    faqSchema(faqs)
  );

  return (
    <>
      <JsonLd data={schema} />

      <SiteNav currentPath="/" />

      <main className="mx-auto max-w-[1680px] px-4 pt-6 pb-4 sm:px-6 lg:px-8">
        <SimpleCalendar
          feed={feed}
          serverTodayKey={getTodayKey(feed.semesters[0].timezone)}
          initialQuery={searchParams ?? {}}
        />

        <Section
          id="overview"
          heading="IPU Academic Calendar 2026-27"
          intro={`This is an interactive academic calendar for Guru Gobind Singh Indraprastha University (GGSIPU), covering the ${feed.semesters.length} semesters of the 2026-27 session for University School of Automobile Research (USAR) students. Every date below is read from the same data that drives the calendar above, so the table and the grid can never disagree.`}
        >
          <SemesterSummaryTable rows={semesterRows} />

          <Prose>
            <p>
              Use the month, week or agenda view to plan around the dates that
              matter. Exams, submissions, campus events and vacations are all
              marked on the grid, and weekend days are shown separately from
              gazetted holidays so you can tell a free Saturday from a declared
              holiday.
            </p>
          </Prose>
        </Section>

        <Section
          id="exam-dates"
          heading="Important Academic Dates: Examinations and Submissions"
          intro="Examination windows and submission deadlines for the 2026-27 session, in date order."
        >
          <EventTable
            rows={assessmentRows}
            caption="GGSIPU examinations and submissions for the 2026-27 session"
          />
        </Section>

        <Section
          id="usar-academic-calendar"
          heading="USAR Academic Calendar"
          intro="Campus events, classes and minor project submissions scheduled at USAR during the 2026-27 session."
        >
          <EventTable
            rows={campusRows}
            caption="USAR academic events for the 2026-27 session"
          />
        </Section>

        <Section
          id="vacations"
          heading="Semester Breaks and Vacations"
          intro="Winter and summer vacation periods that separate each examination block."
        >
          <EventTable
            rows={vacationRows}
            caption="GGSIPU semester vacations for the 2026-27 session"
          />
        </Section>

        <Section
          id="holidays"
          heading="GGSIPU Holiday List 2026-27"
          intro={`${holidayRows.length} gazetted and festival holidays are listed, running from ${formatLongDate(
            holidayRows[0].date
          )} to ${formatLongDate(
            holidayRows[holidayRows.length - 1].date
          )}. Holidays that fall on a Saturday or Sunday are shown here but are not marked on the calendar grid, because those days are already non-working.`}
        >
          <HolidayTable
            rows={holidayRows}
            caption="GGSIPU holiday list for 2026-27"
          />
        </Section>

        <CalendarCta />

        <RelatedLinks
          heading="Related pages"
          links={[
            {
              href: "/ggsipu-academic-calendar",
              title: "GGSIPU Academic Calendar",
              description:
                "Semester dates, exam windows and holidays for the whole 2026-27 GGSIPU session."
            },
            {
              href: "/ipu-academic-calendar",
              title: "IPU Academic Calendar",
              description:
                "The same session viewed through IPU, including term-end examination periods."
            },
            {
              href: "/usar-academic-calendar",
              title: "USAR Academic Calendar",
              description:
                "Dates specific to University School of Automobile Research students."
            },
            {
              href: "/usar-holiday-list",
              title: "USAR Holiday List",
              description:
                "Every gazetted and festival holiday in the list, grouped and dated."
            }
          ]}
        />

        <FaqSection entries={faqs} />

        <p className="mt-10 max-w-3xl text-xs leading-relaxed text-ink-subtle">
          Dates are republished from the USAR academic calendar and IPU holiday
          notifications and are provided for planning convenience only. This
          site is not affiliated with or published by Guru Gobind Singh
          Indraprastha University. Always confirm a date against the official
          university notification.{" "}
          <Link href="/usar-holiday-list" className="font-semibold text-brand">
            See the full USAR holiday list
          </Link>
          .
        </p>
      </main>

      <SiteFooter />
    </>
  );
}
