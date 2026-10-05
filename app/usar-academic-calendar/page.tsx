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
  describeRange,
  groupEventsByType,
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

const PATH = "/usar-academic-calendar";

export const metadata: Metadata = buildPageMetadata({
  title: "USAR Academic Calendar 2026-27 | USAR Semester & Exam Dates",
  description:
    "USAR academic calendar 2026-27 with semester dates, examination schedule, campus events, minor project submissions and vacation periods for USAR students.",
  path: PATH
});

const faqs = [
  {
    question: "What is the USAR academic calendar for 2026-27?",
    answer:
      "USAR follows the GGSIPU session structure. The odd semester runs 3 August 2026 to 17 January 2027 and the even semester 18 January to 18 July 2027. On top of the university dates, the calendar includes USAR-specific items such as club orientation, the induction programme, the sports meet and minor project submissions."
  },
  {
    question: "Which deadlines matter for USAR minor project students?",
    answer:
      "For ARP 455 minor project students the key dates in the odd semester are the synopsis submission on 8 September 2026, Internal Evaluation-I on 29 September 2026 and Internal Evaluation-II on 24 to 25 November 2026."
  },
  {
    question: "Are USAR holidays the same as IPU holidays?",
    answer:
      "They come from the university holiday notification, so they apply across IPU. The full dated list is on the USAR holiday list page."
  }
];

export default function UsarAcademicCalendarPage() {
  const feed = ipuCalendarFeed;

  const semesterRows = feed.semesters.map((semester) => ({
    id: semester.id,
    name: `${semester.name} (USAR)`,
    term: semester.term === "odd" ? "Odd" : "Even",
    window: describeRange(semester.startDate, semester.endDate)
  }));

  const groups = groupEventsByType(feed, "odd-2026-27");
  const evenGroups = groupEventsByType(feed, "even-2026-27");
  const allEvents = [...groups, ...evenGroups].flatMap((group) => group.events);

  const schema = schemaGraph(
    webPageSchema({
      path: PATH,
      name: "USAR Academic Calendar 2026-27",
      description:
        "USAR academic calendar for 2026-27 with semester dates, examinations, campus events and project submission deadlines.",
      breadcrumb: [
        { name: "GGSIPU Academic Calendar 2026-27", path: "/" },
        { name: "USAR Academic Calendar", path: PATH }
      ]
    }),
    eventListSchema(feed.events, { name: "USAR academic events 2026-27", path: PATH }),
    faqSchema(faqs)
  );

  return (
    <>
      <JsonLd data={schema} />

      <SeoPageShell
        currentPath={PATH}
        eyebrow="University School of Automobile Research"
        heading="USAR Academic Calendar 2026-27"
        intro={
          <>
            <p>
              The USAR academic calendar collects every date a student at the
              University School of Automobile Research needs to plan around:
              semester start and end dates, mid-term and term-end examination
              windows, minor project submissions, campus events and the vacation
              periods in between.
            </p>
            <p>
              It runs on the GGSIPU session calendar, so these dates match the{" "}
              <a
                href="/ggsipu-academic-calendar"
                className="font-semibold text-brand hover:underline"
              >
                GGSIPU academic calendar
              </a>
              , with USAR-specific events layered on top.
            </p>
          </>
        }
      >
        <Section
          id="semester-dates"
          heading="USAR Semester Dates"
          intro="When each USAR semester opens and closes in the 2026-27 session."
        >
          <SemesterSummaryTable rows={semesterRows} />
        </Section>

        <Section
          id="important-dates"
          heading="USAR Important Academic Dates"
          intro="Every dated USAR event for the session, grouped by type and listed in date order within each group."
        >
          <div className="flex flex-col gap-6">
            {[...groups, ...evenGroups].map((group) => (
              <div key={`${group.type}-${group.events[0]?.semesterId}`}>
                <h3 className="text-sm font-semibold text-ink">
                  {group.label}
                  <span className="ml-2 text-xs font-normal text-ink-subtle">
                    {group.events[0]?.semesterId === "odd-2026-27"
                      ? "Odd semester"
                      : "Even semester"}
                  </span>
                </h3>
                <div className="mt-2">
                  <EventTable
                    rows={group.events}
                    caption={`USAR ${group.label.toLowerCase()}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section
          id="quick-reference"
          heading="USAR Dates at a Glance"
          intro={`All ${allEvents.length} dated events in the 2026-27 session, in chronological order.`}
        >
          <EventTable
            rows={[...allEvents].sort((left, right) =>
              left.startDate.localeCompare(right.startDate)
            )}
            caption="All USAR academic dates 2026-27"
          />
        </Section>

        <Prose>
          <p>
            Holidays are not repeated on this page because they are identical
            across IPU. See the{" "}
            <a
              href="/usar-holiday-list"
              className="font-semibold text-brand hover:underline"
            >
              USAR holiday list 2026-27
            </a>{" "}
            for the full dated list.
          </p>
        </Prose>

        <CalendarCta />

        <FaqSection heading="USAR Academic Calendar FAQs" entries={faqs} />

        <PageLinks
          links={[
            {
              href: "/usar-holiday-list",
              title: "USAR Holiday List",
              description:
                "Every gazetted and festival holiday in the 2026-27 session."
            },
            {
              href: "/ggsipu-academic-calendar",
              title: "GGSIPU Academic Calendar",
              description: "University-wide semester and examination dates."
            },
            {
              href: "/",
              title: "GGSIPU Academic Calendar 2026-27",
              description: "Open the interactive calendar."
            }
          ]}
        />
      </SeoPageShell>
    </>
  );
}
