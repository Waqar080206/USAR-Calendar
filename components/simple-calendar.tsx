"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  addMonths,
  differenceInCalendarDays,
  format,
  isSameDay
} from "date-fns";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  Variants
} from "framer-motion";

import { CalendarGrid, CalendarView } from "@/components/calendar-grid";
import {
  AnimatedProgress,
  CountUp,
  Panel,
  Reveal,
  Stagger,
  ViewTransition,
  staggerItem
} from "@/components/motion-primitives";
import {
  resolveInitialSemesterId,
  SemesterSwitcher
} from "@/components/semester-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { useTodayKey } from "@/components/use-today-key";
import {
  CalendarItem,
  eventTypeMeta,
  getCalendarItems,
  getDisplayRange,
  getDurationLabel,
  getItemsForDate,
  getSemesterScope,
  getSemesterStats,
  parseDateKey,
  parseMonthKey,
  toDateKey,
  toMonthKey
} from "@/lib/calendar";
import { CalendarFeed, getSemester, SemesterConfig } from "@/lib/types";
import { readQueryValue } from "@/lib/utils";

interface SimpleCalendarProps {
  feed: CalendarFeed;
  /** Rendered date at request time; the client keeps it current from here. */
  serverTodayKey: string;
  initialQuery: Record<string, string | string[] | undefined>;
}

type ViewMode = CalendarView;

interface PortalState {
  semesterId: string;
  monthKey: string;
  dateKey: string;
  view: ViewMode;
  eventId: string | null;
}

const views: Array<{ value: ViewMode; label: string }> = [
  { value: "month", label: "Month" },
  { value: "week", label: "Week" },
  { value: "agenda", label: "Agenda" }
];

function isValidDateKey(value: string | undefined): value is string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = parseDateKey(value);
  return !Number.isNaN(date.getTime()) && toDateKey(date) === value;
}

function isValidMonthKey(value: string | undefined): value is string {
  if (!value || !/^\d{4}-\d{2}$/.test(value)) {
    return false;
  }

  const month = parseMonthKey(value);
  return !Number.isNaN(month.getTime()) && toMonthKey(month) === value;
}

function buildInitialState(
  query: SimpleCalendarProps["initialQuery"],
  todayKey: string,
  feed: CalendarFeed
): PortalState {
  const rawSemester = readQueryValue(query.sem);
  const rawDate = readQueryValue(query.date);
  const rawMonth = readQueryValue(query.month);
  const rawView = readQueryValue(query.view);
  const rawEvent = readQueryValue(query.event);

  const semesterId = resolveInitialSemesterId(feed, todayKey, rawSemester);

  const dateKey = isValidDateKey(rawDate) ? rawDate : todayKey;
  const monthKey = isValidMonthKey(rawMonth)
    ? rawMonth
    : toMonthKey(parseDateKey(dateKey));
  const view = rawView === "week" || rawView === "agenda" ? rawView : "month";

  return {
    semesterId,
    monthKey,
    dateKey,
    view,
    eventId: rawEvent ?? null
  };
}

export function SimpleCalendar({
  feed,
  serverTodayKey,
  initialQuery
}: SimpleCalendarProps) {
  const prefersReducedMotion = useReducedMotion();
  const todayKey = useTodayKey(feed.semesters[0].timezone, serverTodayKey);
  const [state, setState] = useState<PortalState>(() =>
    buildInitialState(initialQuery, serverTodayKey, feed)
  );
  const [shareStatus, setShareStatus] = useState<string | null>(null);
  const directionRef = useRef(0);

  // When the day rolls over, follow it if the view was sitting on "today".
  // A date the user picked, or one pinned by the URL, is left alone.
  const followsToday = !isValidDateKey(readQueryValue(initialQuery.date));
  const lastTodayKey = useRef(serverTodayKey);
  useEffect(() => {
    if (todayKey === lastTodayKey.current) {
      return;
    }

    const previousTodayKey = lastTodayKey.current;
    lastTodayKey.current = todayKey;

    if (!followsToday) {
      return;
    }

    setState((current) =>
      current.dateKey === previousTodayKey
        ? {
            ...current,
            dateKey: todayKey,
            monthKey: toMonthKey(parseDateKey(todayKey))
          }
        : current
    );
  }, [followsToday, todayKey]);

  const scope = useMemo(
    () => getSemesterScope(feed, state.semesterId),
    [feed, state.semesterId]
  );

  const { semester } = scope;

  const semesterItems = useMemo(
    () => getCalendarItems(scope),
    [scope]
  );

  const stats = useMemo(
    () => getSemesterStats(semester, scope.holidays, todayKey),
    [semester, scope.holidays, todayKey]
  );
  const selectedDateItems = useMemo(
    () => getItemsForDate(semesterItems, state.dateKey),
    [semesterItems, state.dateKey]
  );
  const selectedItem = useMemo(
    () =>
      semesterItems.find((item) => item.id === state.eventId) ??
      selectedDateItems[0] ??
      null,
    [semesterItems, selectedDateItems, state.eventId]
  );

  const monthDate = useMemo(
    () => parseMonthKey(state.monthKey),
    [state.monthKey]
  );

  const progressPercent = Math.max(
    0,
    Math.min(
      100,
      Math.round((stats.elapsedDays / Math.max(stats.totalDays, 1)) * 100)
    )
  );

  const dayOfYear = useMemo(() => {
    const today = parseDateKey(todayKey);
    const start = parseDateKey(semester.startDate);
    return differenceInCalendarDays(today, start) + 1;
  }, [todayKey, semester.startDate]);

  const isLiveToday = useMemo(() => {
    const { startDate, endDate } = semester;
    return todayKey >= startDate && todayKey <= endDate;
  }, [todayKey, semester]);

  useEffect(() => {
    if (!state.eventId) {
      return;
    }

    if (!semesterItems.some((item) => item.id === state.eventId)) {
      setState((current) => ({ ...current, eventId: null }));
    }
  }, [semesterItems, state.eventId]);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("sem", state.semesterId);
    params.set("month", state.monthKey);
    params.set("date", state.dateKey);
    params.set("view", state.view);

    if (state.eventId) {
      params.set("event", state.eventId);
    }

    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}?${params.toString()}`
    );
  }, [state]);

  useEffect(() => {
    if (!shareStatus) {
      return undefined;
    }

    const timeout = window.setTimeout(() => setShareStatus(null), 2400);
    return () => window.clearTimeout(timeout);
  }, [shareStatus]);

  const selectDate = useCallback((dateKey: string) => {
    directionRef.current = 0;
    setState((current) => ({
      ...current,
      dateKey,
      monthKey: toMonthKey(parseDateKey(dateKey)),
      eventId: null
    }));
  }, []);

  function shiftMonth(delta: number) {
    directionRef.current = delta;
    setState((current) => {
      const nextMonth = addMonths(parseMonthKey(current.monthKey), delta);

      return {
        ...current,
        monthKey: toMonthKey(nextMonth),
        dateKey: toDateKey(nextMonth),
        eventId: null
      };
    });
  }

  function goToToday() {
    directionRef.current = 0;
    setState((current) => ({
      ...current,
      dateKey: todayKey,
      monthKey: toMonthKey(parseDateKey(todayKey)),
      eventId: null
    }));
  }

  function setView(view: ViewMode) {
    setState((current) => ({ ...current, view }));
  }

  function selectSemester(semesterId: string) {
    directionRef.current = 0;
    const next = getSemester(feed, semesterId);
    setState((current) => ({
      ...current,
      semesterId: next.id,
      dateKey: todayKey,
      monthKey: toMonthKey(parseDateKey(todayKey)),
      eventId: null
    }));
  }

  async function shareCalendar() {
    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title: `${semester.name} calendar`,
          text: "Academic calendar, classes, exams and holidays in one place.",
          url
        });
        setShareStatus("Shared");
        return;
      }

      await navigator.clipboard.writeText(url);
      setShareStatus("Link copied");
    } catch {
      setShareStatus("Share cancelled");
    }
  }

  const selectedDate = parseDateKey(state.dateKey);

  return (
    <div className="relative min-h-dvh overflow-x-hidden">
      <AmbientBackdrop />

      <div className="relative mx-auto max-w-[1680px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        <Reveal>
          <TopBar
            semesterName={semester.name}
            shareStatus={shareStatus}
            onShare={shareCalendar}
          />
        </Reveal>

        <Reveal delay={0.06}>
          <Hero semester={semester} todayKey={todayKey} isLiveToday={isLiveToday} />
        </Reveal>

        <Reveal delay={0.09}>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <SemesterSwitcher
              feed={feed}
              activeSemester={semester}
              todayKey={todayKey}
              onSelect={selectSemester}
            />

            <p className="text-xs text-ink-subtle">
              {feed.semesters.length} semesters published
            </p>
          </div>
        </Reveal>

        <div className="mt-5 grid gap-4 xl:mt-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="flex min-w-0 flex-col gap-4">
            <Reveal delay={0.12}>
              <Panel className="overflow-hidden p-0">
                <CalendarToolbar
                  monthDate={monthDate}
                  view={state.view}
                  todayKey={todayKey}
                  isCurrentMonth={
                    state.monthKey === toMonthKey(parseDateKey(todayKey))
                  }
                  onPrev={() => shiftMonth(-1)}
                  onNext={() => shiftMonth(1)}
                  onToday={goToToday}
                  onView={setView}
                />

                <ViewTransition
                  viewKey={`${state.view}:${state.monthKey}:${state.dateKey}`}
                  direction={directionRef.current}
                  className="px-2 pb-2 sm:px-3 sm:pb-3"
                >
                  <CalendarGrid
                    scope={scope}
                    items={semesterItems}
                    selectedDateKey={state.dateKey}
                    monthKey={state.monthKey}
                    view={state.view}
                    todayKey={todayKey}
                    onSelectDate={selectDate}
                  />
                </ViewTransition>
              </Panel>
            </Reveal>
          </div>

          <div className="flex min-w-0 flex-col gap-4">
            <Reveal delay={0.16}>
              <Panel className="p-5">
                <SidebarHeading
                  title={isSameDay(selectedDate, parseDateKey(todayKey)) ? "Today" : "Selected day"}
                  subtitle={format(selectedDate, "EEEE, d MMMM yyyy")}
                />

                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={selectedItem?.id ?? "empty"}
                    initial={
                      prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 12 }
                    }
                    animate={{ opacity: 1, y: 0 }}
                    exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
                    transition={
                      prefersReducedMotion
                        ? { duration: 0.15 }
                        : { duration: 0.34, ease: [0.16, 1, 0.3, 1] }
                    }
                    className="mt-4"
                  >
                    {selectedItem ? (
                      <EventDetail item={selectedItem} />
                    ) : (
                      <div className="rounded-2xl border border-dashed border-line/70 px-4 py-10 text-center">
                        <p className="text-sm font-medium text-ink-muted">
                          Nothing scheduled on this day.
                        </p>
                        <p className="mt-1 text-xs text-ink-subtle">
                          Pick another date to see its events.
                        </p>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                {selectedDateItems.length > 1 && (
                  <div className="mt-4 flex flex-col gap-1.5 border-t border-line/50 pt-4">
                    {selectedDateItems.slice(0, 4).map((item) => {
                      const meta = eventTypeMeta[item.type];

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() =>
                            setState((current) => ({ ...current, eventId: item.id }))
                          }
                          className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-sunken"
                        >
                          <span
                            className={`h-1.5 w-1.5 shrink-0 rounded-full ${meta.accentClass}`}
                            aria-hidden="true"
                          />
                          <span className="min-w-0 flex-1 truncate text-xs font-medium text-ink-muted">
                            {item.title}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </Panel>
            </Reveal>

            <Reveal delay={0.2}>
              <Panel className="p-5">
                <SidebarHeading
                  title="Semester progress"
                  subtitle={`${format(parseDateKey(semester.startDate), "d MMM")} – ${format(parseDateKey(semester.endDate), "d MMM yyyy")}`}
                />

                <div className="mt-4 flex items-end justify-between gap-3">
                  <p className="text-3xl font-semibold text-ink tabular-nums">
                    <CountUp value={progressPercent} suffix="%" />
                  </p>
                  <p className="text-xs font-medium text-ink-subtle tabular-nums">
                    Day <CountUp value={dayOfYear} /> of {stats.totalDays}
                  </p>
                </div>

                <AnimatedProgress percent={progressPercent} className="mt-3" />

                <Stagger className="mt-4 grid grid-cols-2 gap-2">
                  <StatTile
                    label="Days left"
                    value={stats.remainingDays}
                    variants={staggerItem}
                  />
                  <StatTile
                    label="Working left"
                    value={stats.workingDaysRemaining}
                    variants={staggerItem}
                  />
                </Stagger>
              </Panel>
            </Reveal>
          </div>
        </div>

        <Reveal delay={0.28}>
          <footer className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-line/50 pt-6 text-xs text-ink-subtle sm:flex-row">
            <p>
              {semester.name} · times shown in {semester.timezone}
            </p>
            <a
              href="https://github.com/Waqar080206/USAR-Calendar"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-brand transition-colors hover:text-brand/75"
            >
              Star on GitHub
            </a>
          </footer>
        </Reveal>
      </div>
    </div>
  );
}

function AmbientBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-canvas" />
      <div className="absolute -top-40 -left-32 h-[34rem] w-[34rem] rounded-full bg-[radial-gradient(circle,rgb(var(--aurora-a)/0.22),transparent_65%)] blur-3xl animate-aurora-drift" />
      <div
        className="absolute top-1/4 -right-40 h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(circle,rgb(var(--aurora-b)/0.18),transparent_65%)] blur-3xl animate-aurora-drift-slow"
      />
      <div className="absolute -bottom-48 left-1/3 h-[32rem] w-[32rem] rounded-full bg-[radial-gradient(circle,rgb(var(--aurora-c)/0.14),transparent_65%)] blur-3xl animate-aurora-drift" />
      <div className="surface-grid absolute inset-0" />
      <div className="grain absolute inset-0 opacity-60" />
    </div>
  );
}

function TopBar({
  semesterName,
  shareStatus,
  onShare
}: {
  semesterName: string;
  shareStatus: string | null;
  onShare: () => void;
}) {
  return (
    <header className="mb-5 flex flex-wrap items-center justify-between gap-3 sm:mb-6">
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-ink">
          <Image
            src="/sm.png"
            alt=""
            width={36}
            height={36}
            priority
            className="h-full w-full object-cover"
          />
        </span>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-ink">USAR Calendar</p>
          <p className="text-[11px] text-ink-subtle">{semesterName}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <motion.button
          type="button"
          onClick={onShare}
          whileTap={{ scale: 0.96 }}
          className="flex h-10 items-center gap-2 rounded-xl bg-ink px-3.5 text-xs font-semibold text-canvas transition-opacity hover:opacity-90"
        >
          <ShareIcon />
          <span className="hidden sm:inline">
            {shareStatus ?? "Share"}
          </span>
        </motion.button>
      </div>
    </header>
  );
}

function Hero({
  semester,
  todayKey,
  isLiveToday
}: {
  semester: SemesterConfig;
  todayKey: string;
  isLiveToday: boolean;
}) {
  return (
    <section className="panel relative overflow-hidden rounded-4xl p-5 sm:p-7 lg:p-9">
      <div className="surface-grid pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgb(var(--brand)/0.16),transparent_70%)] blur-2xl" />

      <div className="relative">
        <span className="inline-flex items-center gap-2 rounded-full border border-line/60 bg-surface/70 px-3 py-1.5 text-[10px] font-bold tracking-[0.2em] text-ink-muted uppercase">
          {isLiveToday ? (
            <>
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-brand opacity-60 animate-pulse-dot" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand" />
              </span>
              Semester in progress
            </>
          ) : (
            "Academic calendar"
          )}
        </span>

        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-balance text-ink sm:text-4xl lg:text-5xl">
          Classes, exams and holidays in one view.
        </h1>

        <p className="mt-3 max-w-xl text-sm leading-relaxed text-pretty text-ink-muted sm:text-[15px]">
          Built for {semester.name}. Pick a date to see what it means for your
          schedule, or share a deep link that opens on the exact month, day and
          event.
        </p>
      </div>
    </section>
  );
}

function CalendarToolbar({
  monthDate,
  view,
  todayKey,
  isCurrentMonth,
  onPrev,
  onNext,
  onToday,
  onView
}: {
  monthDate: Date;
  view: ViewMode;
  todayKey: string;
  isCurrentMonth: boolean;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onView: (view: ViewMode) => void;
}) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="flex flex-col gap-3 border-b border-line/50 p-3 sm:p-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center justify-between gap-2 lg:justify-start">
        <div className="flex items-center gap-1">
          <IconButton label="Previous month" onClick={onPrev}>
            <ChevronLeftIcon />
          </IconButton>
          <IconButton label="Next month" onClick={onNext}>
            <ChevronRightIcon />
          </IconButton>
        </div>

        <div className="lg:ml-2">
          <h2 className="text-lg font-semibold tracking-tight text-ink sm:text-xl">
            {format(monthDate, "MMMM yyyy")}
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <motion.button
          type="button"
          onClick={onToday}
          whileTap={prefersReducedMotion ? undefined : { scale: 0.96 }}
          className="h-9 rounded-lg border border-line/70 px-3 text-xs font-semibold text-ink-muted transition-colors hover:border-brand/40 hover:text-brand"
        >
          {isCurrentMonth ? "Today" : `Go to ${format(parseDateKey(todayKey), "d MMM")}`}
        </motion.button>

        <div
          role="tablist"
          aria-label="Calendar view"
          className="flex rounded-xl border border-line/60 bg-sunken/70 p-1"
        >
          {views.map((option) => {
            const isActive = option.value === view;

            return (
              <button
                key={option.value}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => onView(option.value)}
                className={`relative rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  isActive ? "text-brand-ink" : "text-ink-subtle hover:text-ink"
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="view-pill"
                    aria-hidden="true"
                    className="absolute inset-0 rounded-lg bg-brand"
                    transition={
                      prefersReducedMotion
                        ? { duration: 0 }
                        : { type: "spring", stiffness: 420, damping: 34 }
                    }
                  />
                )}
                <span className="relative z-10">{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function IconButton({
  label,
  onClick,
  children
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.button
      type="button"
      aria-label={label}
      onClick={onClick}
      whileHover={prefersReducedMotion ? undefined : { scale: 1.06 }}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.92 }}
      transition={
        prefersReducedMotion
          ? { duration: 0 }
          : { type: "spring", stiffness: 460, damping: 26 }
      }
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-line/70 text-ink-muted transition-colors hover:border-brand/40 hover:text-brand"
    >
      {children}
    </motion.button>
  );
}

function SidebarHeading({
  title,
  subtitle
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div>
      <h3 className="text-[10px] font-bold tracking-[0.18em] text-ink-subtle uppercase">
        {title}
      </h3>
      <p className="mt-1 text-sm font-semibold text-ink">{subtitle}</p>
    </div>
  );
}

function StatTile({
  label,
  value,
  variants
}: {
  label: string;
  value: number;
  variants?: Variants;
}) {
  return (
    <motion.div
      variants={variants}
      className="rounded-xl border border-line/50 bg-sunken/50 px-2.5 py-2.5"
    >
      <p className="text-[9px] font-bold tracking-[0.1em] text-ink-subtle uppercase">
        {label}
      </p>
      <p className="mt-0.5 text-lg font-semibold text-ink tabular-nums">
        <CountUp value={value} />
      </p>
    </motion.div>
  );
}

function EventDetail({ item }: { item: CalendarItem }) {
  const prefersReducedMotion = useReducedMotion();
  const meta = eventTypeMeta[item.type];

  return (
    <motion.article
      whileHover={prefersReducedMotion ? undefined : { y: -2 }}
      transition={
        prefersReducedMotion
          ? { duration: 0 }
          : { type: "spring", stiffness: 340, damping: 30 }
      }
      className={`relative overflow-hidden rounded-2xl p-4 ring-1 ring-inset ${meta.surfaceClass}`}
    >
      <span
        className={`absolute inset-y-0 left-0 w-1 ${meta.accentClass}`}
        aria-hidden="true"
      />

      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-bold tracking-wide uppercase ${meta.chipClass} ring-1 ring-inset`}
      >
        {meta.label}
      </span>

      <h4 className="mt-3 text-[15px] leading-snug font-semibold text-balance text-ink">
        {item.title}
      </h4>

      <dl className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] text-ink-muted">
        <div className="flex items-center gap-1.5">
          <dt className="text-ink-subtle">When</dt>
          <dd className="font-semibold">{getDisplayRange(item)}</dd>
        </div>
        <div className="flex items-center gap-1.5">
          <dt className="text-ink-subtle">Length</dt>
          <dd className="font-semibold">{getDurationLabel(item)}</dd>
        </div>
      </dl>

      {item.description && (
        <p className="mt-3 border-t border-current/10 pt-3 text-xs leading-relaxed text-pretty text-ink-muted">
          {item.description}
        </p>
      )}

      {item.source && (
        <p className="mt-3 text-[10px] font-medium tracking-wide text-ink-subtle uppercase">
          {item.source}
        </p>
      )}
    </motion.article>
  );
}

function ChevronLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="m14.5 6-6 6 6 6" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="m9.5 6 6 6-6 6" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="17.5" cy="6" r="2.6" />
      <circle cx="6.5" cy="12" r="2.6" />
      <circle cx="17.5" cy="18" r="2.6" />
      <path d="m8.9 10.7 6.3-3.4M8.9 13.3l6.3 3.4" />
    </svg>
  );
}
