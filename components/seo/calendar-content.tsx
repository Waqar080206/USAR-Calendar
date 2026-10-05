import Link from "next/link";

import {
  EventRow,
  HolidayRow,
  describeRange,
  formatCompactDate,
  formatLongDate
} from "@/lib/calendar-content";

/**
 * Server-rendered reference tables.
 *
 * The interactive grid only ever paints one month of one semester, so without
 * these tables a crawler would see a month of chips and nothing else. Rendering
 * the same feed as real HTML keeps one source of truth while making every date
 * in it indexable.
 */

export function Section({
  id,
  heading,
  intro,
  children
}: {
  id?: string;
  heading: string;
  intro?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mt-10 scroll-mt-24">
      <h2 className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">
        {heading}
      </h2>
      {intro ? (
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-muted">
          {intro}
        </p>
      ) : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function EventTable({
  rows,
  caption
}: {
  rows: EventRow[];
  caption?: string;
}) {
  if (rows.length === 0) {
    return null;
  }

  return (
    <div className="panel overflow-hidden rounded-3xl">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[38rem] border-collapse text-left text-sm">
          {caption ? (
            <caption className="sr-only">{caption}</caption>
          ) : null}
          <thead>
            <tr className="border-b border-line/60 text-[10px] tracking-[0.14em] text-ink-subtle uppercase">
              <th scope="col" className="px-4 py-3 font-bold">
                Event
              </th>
              <th scope="col" className="px-4 py-3 font-bold">
                Dates
              </th>
              <th scope="col" className="px-4 py-3 font-bold">
                Duration
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-line/40 last:border-b-0 align-top"
              >
                <th scope="row" className="px-4 py-3 font-medium">
                  <span className="block font-semibold text-ink">{row.title}</span>
                  <span className="mt-0.5 block text-xs text-ink-subtle">
                    {row.category}
                  </span>
                  {row.description ? (
                    <span className="mt-1 block max-w-prose text-xs leading-relaxed text-ink-muted">
                      {row.description}
                    </span>
                  ) : null}
                </th>
                <td className="px-4 py-3 text-ink-muted">
                  <span className="whitespace-nowrap tabular-nums">
                    {formatCompactDate(row.startDate)}
                  </span>
                  {row.startDate !== row.endDate ? (
                    <span className="whitespace-nowrap tabular-nums">
                      {" – "}
                      {formatCompactDate(row.endDate)}
                    </span>
                  ) : null}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-ink-subtle tabular-nums">
                  {row.duration}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function HolidayTable({
  rows,
  caption
}: {
  rows: HolidayRow[];
  caption?: string;
}) {
  if (rows.length === 0) {
    return null;
  }

  const gazetted = rows.filter((row) => row.category.startsWith("Gazetted"));
  const festival = rows.filter((row) => !row.category.startsWith("Gazetted"));

  return (
    <div className="flex flex-col gap-5">
      <HolidayGroup
        title="Gazetted holidays"
        rows={gazetted}
        caption={caption ? `${caption} - gazetted holidays` : "Gazetted holidays"}
      />
      <HolidayGroup
        title="Festival holidays"
        rows={festival}
        caption={
          caption ? `${caption} - festival holidays` : "Festival holidays"
        }
      />
    </div>
  );
}

function HolidayGroup({
  title,
  rows,
  caption
}: {
  title: string;
  rows: HolidayRow[];
  caption: string;
}) {
  if (rows.length === 0) {
    return null;
  }

  return (
    <div className="panel overflow-hidden rounded-3xl">
      <div className="border-b border-line/60 px-4 py-3">
        <h3 className="text-sm font-semibold text-ink">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[34rem] border-collapse text-left text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr className="border-b border-line/40 text-[10px] tracking-[0.14em] text-ink-subtle uppercase">
              <th scope="col" className="px-4 py-3 font-bold">
                Date
              </th>
              <th scope="col" className="px-4 py-3 font-bold">
                Holiday
              </th>
              <th scope="col" className="px-4 py-3 font-bold">
                Notes
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-line/40 last:border-b-0 align-top"
              >
                <th scope="row" className="px-4 py-3 font-medium whitespace-nowrap text-ink tabular-nums">
                  {formatLongDate(row.date)}
                </th>
                <td className="px-4 py-3 font-medium text-ink">{row.name}</td>
                <td className="px-4 py-3 text-xs text-ink-subtle">
                  {row.fallsOnWeekend ? (
                    <span>
                      Falls on a {formatLongDate(row.date).split(",")[0]} &mdash;
                      already a weekend, so it is not separately marked on the
                      calendar.
                    </span>
                  ) : (
                    row.description ?? "Observed by GGSIPU on this date."
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function SemesterSummaryTable({
  rows
}: {
  rows: Array<{ id: string; name: string; window: string; term: string }>;
}) {
  return (
    <div className="panel overflow-hidden rounded-3xl">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
          <caption className="sr-only">
            GGSIPU semester dates for the 2026-27 session
          </caption>
          <thead>
            <tr className="border-b border-line/60 text-[10px] tracking-[0.14em] text-ink-subtle uppercase">
              <th scope="col" className="px-4 py-3 font-bold">
                Semester
              </th>
              <th scope="col" className="px-4 py-3 font-bold">
                Term
              </th>
              <th scope="col" className="px-4 py-3 font-bold">
                Runs from
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-line/40 last:border-b-0">
                <th scope="row" className="px-4 py-3 font-semibold text-ink">
                  {row.name}
                </th>
                <td className="px-4 py-3 text-ink-muted capitalize">{row.term}</td>
                <td className="px-4 py-3 whitespace-nowrap text-ink-muted tabular-nums">
                  {row.window}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function FaqSection({
  heading = "Frequently Asked Questions",
  entries
}: {
  heading?: string;
  entries: Array<{ question: string; answer: string }>;
}) {
  return (
    <Section
      id="faq"
      heading={heading}
      intro="Short answers to the questions students ask most about this calendar."
    >
      <div className="flex flex-col gap-3">
        {entries.map((entry) => (
          <details
            key={entry.question}
            className="panel group rounded-2xl px-4 py-3"
          >
            <summary className="cursor-pointer list-none text-sm font-semibold text-ink marker:hidden">
              <span className="flex items-start justify-between gap-3">
                {entry.question}
                <span
                  aria-hidden="true"
                  className="mt-0.5 shrink-0 text-ink-subtle transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </span>
            </summary>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-muted">
              {entry.answer}
            </p>
          </details>
        ))}
      </div>
    </Section>
  );
}

export function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-4 flex max-w-3xl flex-col gap-3 text-sm leading-relaxed text-ink-muted">
      {children}
    </div>
  );
}

export function RelatedLinks({
  heading,
  links
}: {
  heading: string;
  links: Array<{ href: string; title: string; description: string }>;
}) {
  return (
    <Section heading={heading}>
      <div className="grid gap-3 sm:grid-cols-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="panel group flex flex-col gap-1 rounded-2xl px-4 py-4 transition-colors hover:bg-elevated"
          >
            <span className="text-sm font-semibold text-ink group-hover:text-brand">
              {link.title}
            </span>
            <span className="text-xs leading-relaxed text-ink-subtle">
              {link.description}
            </span>
          </Link>
        ))}
      </div>
    </Section>
  );
}

/** Month-by-month index, so long-tail "holidays in November 2026" can match. */
export function MonthIndex({
  heading,
  groups
}: {
  heading: string;
  groups: Array<{ month: string; entries: string[] }>;
}) {
  const populated = groups.filter((group) => group.entries.length > 0);

  if (populated.length === 0) {
    return null;
  }

  return (
    <Section heading={heading}>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {populated.map((group) => (
          <div key={group.month} className="panel rounded-2xl px-4 py-3">
            <h3 className="text-sm font-semibold text-ink">{group.month}</h3>
            <ul className="mt-2 flex flex-col gap-1 text-xs text-ink-muted">
              {group.entries.map((entry) => (
                <li key={entry}>{entry}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
}

export function CalendarCta({
  semesterId,
  month,
  date
}: {
  semesterId?: string;
  month?: string;
  date?: string;
}) {
  const params = new URLSearchParams();
  if (semesterId) params.set("sem", semesterId);
  if (month) params.set("month", month);
  if (date) params.set("date", date);

  const query = params.toString();
  const href = query ? `/?${query}` : "/";

  return (
    <div className="panel mt-6 flex flex-col gap-3 rounded-3xl px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-semibold text-ink">
          Open the interactive calendar
        </p>
        <p className="mt-1 text-xs leading-relaxed text-ink-muted">
          Month, week and agenda views, with shareable deep links to any date or
          event.
        </p>
      </div>
      <Link
        href={href}
        className="inline-flex shrink-0 items-center justify-center rounded-xl bg-ink px-4 py-2.5 text-xs font-semibold text-canvas transition-opacity hover:opacity-90"
      >
        View Interactive Calendar
      </Link>
    </div>
  );
}
