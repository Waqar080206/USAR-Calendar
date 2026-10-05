import type { Metadata } from "next";

import { JsonLd } from "@/components/json-ld";
import { PageLinks, SeoPageShell } from "@/components/seo/seo-page";
import {
  CalendarCta,
  EventTable,
  FaqSection,
  HolidayTable,
  Prose,
  SemesterSummaryTable,
  Section
} from "@/components/seo/calendar-content";
import {
  assessmentEvents,
  describeRange,
  toEventRows,
  toHolidayRows
} from "@/lib/calendar-content";
import { ipuCalendarFeed } from "@/lib/data/ipu-calendar";
import { buildPageMetadata } from "@/lib/metadata";
import { faqSchema, schemaGraph, webPageSchema } from "@/lib/structured-data";

const PATH = "/ggsipu-academic-calendar";

export const metadata: Metadata = buildPageMetadata({
  title: "GGSIPU Academic Calendar 2026-27: Semester & Exam Dates",
  description:
    "GGSIPU academic calendar 2026-27 with odd and even semester dates, mid-term and term-end exam schedules, vacation periods and the gazetted holiday list for IPU students.",
  path: PATH
});

const faqs = [
  {
    question: "What are the GGSIPU semester dates for 2026-27?",
    answer:
      "The odd semester runs from 3 August 2026 to 17 January 2027 and the even semester runs from 18 January 2027 to 18 July 2027. Each semester opens with an 18-week instruction block on a five-day working week, moves into term-end examinations, and closes with a vacation."
  },
  {
    question: "When do GGSIPU mid-term exams start?",
    answer:
      "For the odd semester, Mid-Term Examinations-I runs from 21 to 26 September 2026 and Mid-Term Examinations-II runs from 16 to 21 November 2026. Internal evaluation and internal laboratory examinations follow later in November."
  },
  {
    question: "When are GGSIPU term-end examinations held?",
    answer:
      "Odd semester practical examinations run from 30 November to 10 December 2026, followed by theory examinations from 11 December 2026 to 3 January 2027. Winter vacation is 4 to 17 January 2027. The even semester term-end block runs from 24 May to 20 June 2027."
  },
  {
    question: "How many holidays are in the GGSIPU 2026-27 list?",
    answer:
      "The list covers 10 dates from Independence Day on 15 August 2026 through Independence Day on 15 August 2027. 2027 festival dates are excluded because they are not gazetted until the university issues its notification."
  }
];

export default function GgsipuAcademicCalendarPage() {
  const feed = ipuCalendarFeed;
  const holidayRows = toHolidayRows(feed.holidays);

  const semesterRows = feed.semesters.map((semester) => ({
    id: semester.id,
    name: semester.name,
    term: semester.term === "odd" ? "Odd" : "Even",
    window: describeRange(semester.startDate, semester.endDate)
  }));

  const oddExams = toEventRows(
    assessmentEvents(feed, "odd-2026-27")
  );
  const evenExams = toEventRows(
    assessmentEvents(feed, "even-2026-27")
  );

  const schema = schemaGraph(
    webPageSchema({
      path: PATH,
      name: "GGSIPU Academic Calendar 2026-27",
      description:
        "GGSIPU academic calendar 2026-27 with odd and even semester dates, examination schedules, vacation periods and the gazetted holiday list.",
      breadcrumb: [
        { name: "GGSIPU Academic Calendar 2026-27", path: "/" },
        { name: "GGSIPU Academic Calendar", path: PATH }
      ]
    }),
    faqSchema(faqs)
  );

  return (
    <>
      <JsonLd data={schema} />

      <SeoPageShell
        currentPath={PATH}
        eyebrow="GGSIPU 2026-27 session"
        heading="GGSIPU Academic Calendar 2026-27"
        intro={
          <>
            <p>
              The GGSIPU academic calendar for the 2026-27 session, laid out as
              plain dates you can read without loading anything. It covers both
              semesters: when classes commence, when the mid-term and term-end
              examinations run, where the vacation periods fall and which days
              are gazetted holidays.
            </p>
            <p>
              Everything on this page comes from the same published feed that
              drives the interactive calendar, so these tables and the month
              grid never drift apart.
            </p>
          </>
        }
      >
        <Section
          id="semester-dates"
          heading="GGSIPU Semester Dates"
          intro="The two semesters of the 2026-27 session and the window each one covers."
        >
          <SemesterSummaryTable rows={semesterRows} />
        </Section>

        <Section
          id="odd-exam-dates"
          heading="Odd Semester Exam Dates 2026"
          intro="Mid-term, internal evaluation and term-end examination blocks for the August 2026 to January 2027 semester."
        >
          <EventTable
            rows={oddExams}
            caption="GGSIPU odd semester examination dates for 2026-27"
          />
        </Section>

        <Section
          id="even-exam-dates"
          heading="Even Semester Exam Dates 2027"
          intro="Examination and evaluation dates for the January to July 2027 semester."
        >
          <EventTable
            rows={evenExams}
            caption="GGSIPU even semester examination dates for 2027"
          />
        </Section>

        <Section
          id="holidays"
          heading="GGSIPU Holiday List 2026-27"
          intro="Gazetted and festival holidays across both semesters of the session."
        >
          <HolidayTable rows={holidayRows} caption="GGSIPU holidays 2026-27" />
        </Section>

        <CalendarCta />

        <FaqSection entries={faqs} />

        <PageLinks
          links={[
            {
              href: "/ipu-academic-calendar",
              title: "IPU Academic Calendar",
              description:
                "The same session read from the IPU perspective, including term-end periods."
            },
            {
              href: "/usar-holiday-list",
              title: "USAR Holiday List",
              description:
                "The complete holiday table with dates, weekdays and weekend notes."
            },
            {
              href: "/",
              title: "GGSIPU Academic Calendar 2026-27",
              description:
                "Open the interactive calendar with month, week and agenda views."
            }
          ]}
        />
      </SeoPageShell>
    </>
  );
}
