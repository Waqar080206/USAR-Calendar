import type { Metadata } from "next";

import { JsonLd } from "@/components/json-ld";
import { PageLinks, SeoPageShell } from "@/components/seo/seo-page";
import {
  CalendarCta,
  EventTable,
  FaqSection,
  Prose,
  SemesterSummaryTable,
  Section
} from "@/components/seo/calendar-content";
import {
  assessmentEvents,
  describeRange,
  formatLongDate,
  toEventRows
} from "@/lib/calendar-content";
import { ipuCalendarFeed } from "@/lib/data/ipu-calendar";
import { buildPageMetadata } from "@/lib/metadata";
import {
  eventListSchema,
  faqSchema,
  schemaGraph,
  webPageSchema
} from "@/lib/structured-data";

const PATH = "/ipu-academic-calendar";

export const metadata: Metadata = buildPageMetadata({
  title: "IPU Academic Calendar 2026-27 | Semester & Exam Dates",
  description:
    "IPU academic calendar for 2026-27: semester start and end dates, mid-term and term-end examination schedules, semester breaks and declared holidays for Indraprastha University students.",
  path: PATH
});

const faqs = [
  {
    question: "When does IPU start the odd semester in 2026?",
    answer:
      "Instruction for odd semesters begins on 3 August 2026 and the semester itself runs to 17 January 2027. Term-end examinations begin in the first week of December 2026."
  },
  {
    question: "What is the IPU semester pattern?",
    answer:
      "Each semester follows the same shape: an 18-week instruction period on a five-day working week, mid-term examinations during the term, then a term-end block that closes with a vacation. The odd semester ends with winter vacation and the even semester with summer vacation."
  },
  {
    question: "Is the IPU academic calendar the same for every college?",
    answer:
      "Semester and examination dates are fixed at university level, so they apply across affiliated colleges and schools. Individual subjects may schedule internal assessments differently, but the published windows are common."
  },
  {
    question: "Does this IPU calendar include university holidays?",
    answer:
      "Yes. Declared gazetted and festival holidays are listed alongside the academic dates, and any holiday that falls on a weekend is flagged so you can see it is already a non-working day."
  }
];

export default function IpuAcademicCalendarPage() {
  const feed = ipuCalendarFeed;

  const semesterRows = feed.semesters.map((semester) => ({
    id: semester.id,
    name: semester.name,
    term: semester.term === "odd" ? "Odd" : "Even",
    window: describeRange(semester.startDate, semester.endDate)
  }));

  const allAssessments = toEventRows(assessmentEvents(feed));
  const breaks = toEventRows(feed.events.filter((event) => event.type === "break"));

  const firstOdd = feed.semesters[0];
  const lastEven = feed.semesters[feed.semesters.length - 1];

  const schema = schemaGraph(
    webPageSchema({
      path: PATH,
      name: "IPU Academic Calendar 2026-27",
      description:
        "IPU academic calendar for 2026-27 covering semester dates, examinations, semester breaks and declared holidays.",
      breadcrumb: [
        { name: "GGSIPU Academic Calendar 2026-27", path: "/" },
        { name: "IPU Academic Calendar", path: PATH }
      ]
    }),
    eventListSchema(assessmentEvents(feed), {
      name: "IPU examinations and submissions 2026-27",
      path: PATH
    }),
    faqSchema(faqs)
  );

  return (
    <>
      <JsonLd data={schema} />

      <SeoPageShell
        currentPath={PATH}
        eyebrow="Indraprastha University"
        heading="IPU Academic Calendar 2026-27"
        intro={
          <>
            <p>
              IPU runs two semesters a year. This page lists the{" "}
              {formatLongDate(firstOdd.startDate)} to{" "}
              {formatLongDate(lastEven.endDate)} session as a set of dated
              tables: when each semester starts and ends, when examinations
              run, where the semester breaks fall and which days are declared
              holidays.
            </p>
            <p>
              It is the same data that powers the{" "}
              <a
                href="/"
                className="font-semibold text-brand hover:underline"
              >
                interactive IPU academic calendar
              </a>
              , presented here as plain text for reading, printing or checking a
              single date quickly.
            </p>
          </>
        }
      >
        <Section
          id="semester-dates"
          heading="IPU Semester Dates"
          intro="Start and end dates for both semesters of the 2026-27 session."
        >
          <SemesterSummaryTable rows={semesterRows} />
        </Section>

        <Section
          id="exam-dates"
          heading="IPU Exam Dates 2026-27"
          intro="Every mid-term, internal evaluation and term-end examination window, in date order."
        >
          <EventTable
            rows={allAssessments}
            caption="IPU examination dates for the 2026-27 session"
          />
        </Section>

        <Section
          id="semester-breaks"
          heading="IPU Semester Breaks"
          intro="Vacation periods that close out each semester."
        >
          <EventTable
            rows={breaks}
            caption="IPU semester vacation periods 2026-27"
          />
        </Section>

        <Prose>
          <p>
            The odd semester closes with winter vacation and the even semester
            with summer vacation. Holidays inside these terms are listed in
            full on the{" "}
            <a
              href="/usar-holiday-list"
              className="font-semibold text-brand hover:underline"
            >
              USAR holiday list
            </a>
            .
          </p>
        </Prose>

        <CalendarCta />

        <FaqSection heading="IPU Academic Calendar FAQs" entries={faqs} />

        <PageLinks
          links={[
            {
              href: "/ggsipu-academic-calendar",
              title: "GGSIPU Academic Calendar",
              description:
                "The university-named view of the same 2026-27 session dates."
            },
            {
              href: "/usar-academic-calendar",
              title: "USAR Academic Calendar",
              description:
                "Dates specific to University School of Automobile Research."
            },
            {
              href: "/usar-holiday-list",
              title: "USAR Holiday List",
              description: "Full gazetted and festival holiday table."
            }
          ]}
        />
      </SeoPageShell>
    </>
  );
}
