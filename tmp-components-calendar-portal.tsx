"use client";

import { addMonths, compareAsc, format, isBefore, isSameMonth, subMonths } from "date-fns";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  CalendarItem,
  eventTypeMeta,
  eventTypeOrder,
  filterItemsByTypes,
  getCalendarItems,
  getDisplayRange,
  getDurationLabel,
  getItemsForDate,
  getMonthDays,
  getSemesterStats,
  getUpcomingItems,
  getWeekDays,
  parseDateKey,
  parseMonthKey,
  toDateKey,
  toMonthKey
} from "@/lib/calendar";
import { CalendarEventType, CalendarFeed } from "@/lib/types";
import { cn, readQueryValue } from "@/lib/utils";

type ViewMode = "month" | "week" | "agenda";

interface PortalState {
  monthKey: string;
  dateKey: string;
  view: ViewMode;
  eventId: string | null;
  activeTypes: CalendarEventType[];
}

interface CalendarPortalProps {
  feed: CalendarFeed;
  initialQuery: { [key: string]: string | string[] | undefined };
  todayKey: string;
}

const allEventTypes = [...eventTypeOrder];
const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const shortWeekdayLabels = ["S", "M", "T", "W", "T", "F", "S"];

function isValidDateKey(value: string | undefined) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = parseDateKey(value);
  return !Number.isNaN(date.getTime()) && toDateKey(date) === value;
}

function isValidMonthKey(value: string | undefined) {
  if (!value || !/^\d{4}-\d{2}$/.test(value)) {
    return false;
  }

  const month = parseMonthKey(value);
  return !Number.isNaN(month.getTime()) && toMonthKey(month) === value;
}

function isViewMode(value: string | undefined): value is ViewMode {
  return value === "month" || value === "week" || value === "agenda";
}

function parseTypeFilters(queryValue: string | undefined) {
  if (!queryValue) {
    return [];
  }

  const types = queryValue
    .split(",")
    .map((type) => type.trim())
    .filter((type): type is CalendarEventType =>
      allEventTypes.includes(type as CalendarEventType)
    );

  return Array.from(new Set(types));
}

function buildInitialState(
  initialQuery: CalendarPortalProps["initialQuery"],
  todayKey: string
): PortalState {
  const rawMonth = readQueryValue(initialQuery.month);
  const rawDate = readQueryValue(initialQuery.date);
  const rawView = readQueryValue(initialQuery.view);
  const rawEvent = readQueryValue(initialQuery.event);
  const rawTypes = readQueryValue(initialQuery.types);
  const dateKey = isValidDateKey(rawDate) ? rawDate : todayKey;
  const monthKey = isValidMonthKey(rawMonth)
    ? rawMonth
    : toMonthKey(parseDateKey(dateKey));

  return {
    monthKey,
    dateKey,
    view: isViewMode(rawView) ? rawView : "month",
    eventId: rawEvent ?? null,
    activeTypes: parseTypeFilters(rawTypes)
  };
}

function useCompactLayout() {
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1023px)");
    const updateCompact = () => setIsCompact(mediaQuery.matches);

    updateCompact();
    mediaQuery.addEventListener("change", updateCompact);

    return () => mediaQuery.removeEventListener("change", updateCompact);
  }, []);

  return isCompact;
}

function getAgendaDateKey(item: CalendarItem, fromDateKey: string) {
  const fromDate = parseDateKey(fromDateKey);
  const itemStart = parseDateKey(item.startDate);

  return isBefore(itemStart, fromDate) ? fromDateKey : item.startDate;
}

function buildAgendaGroups(items: CalendarItem[], fromDateKey: string) {
  const groups = new Map<string, CalendarItem[]>();

  items.forEach((item) => {
    const key = getAgendaDateKey(item, fromDateKey);
    const current = groups.get(key) ?? [];
    current.push(item);
    groups.set(key, current);
  });

  return Array.from(groups.entries())
    .sort(([left], [right]) =>
      compareAsc(parseDateKey(left), parseDateKey(right))
    )
    .map(([dateKey, groupedItems]) => ({
      dateKey,
      items: groupedItems
    }));
}

function getSegmentType(item: CalendarItem, dateKey: string) {
  const startsToday = item.startDate === dateKey;
  const endsToday = item.endDate === dateKey;

  if (startsToday && endsToday) {
    return "single";
  }

  if (startsToday) {
    return "start";
  }

  if (endsToday) {
    return "end";
  }

  return "middle";
}

function getSegmentLabel(item: CalendarItem, dateKey: string) {
  const segment = getSegmentType(item, dateKey);

  if (segment === "middle") {
    return "Continues";
  }

  if (segment === "end") {
    return `Ends: ${item.title}`;
  }

  return item.title;
}

function scrollToSection(sectionId: string) {
  const section = document.getElementById(sectionId);
  section?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function CalendarPortal({
  feed,
  initialQuery,
  todayKey
}: CalendarPortalProps) {
  const isCompact = useCompactLayout();
  const hasAutoSelectedView = useRef(false);
  const [state, setState] = useState<PortalState>(() =>
    buildInitialState(initialQuery, todayKey)
  );
  const [shareStatus, setShareStatus] = useState<string | null>(null);
  const allItems = useMemo(() => getCalendarItems(feed), [feed]);

  useEffect(() => {
    const hasViewInQuery = Boolean(readQueryValue(initialQuery.view));

    if (!hasViewInQuery && isCompact && !hasAutoSelectedView.current) {
      setState((current) => ({ ...current, view: "agenda" }));
      hasAutoSelectedView.current = true;
    }
  }, [initialQuery.view, isCompact]);

  useEffect(() => {
    const params = new URLSearchParams();

    params.set("month", state.monthKey);
    params.set("date", state.dateKey);
    params.set("view", state.view);

    if (state.eventId) {
      params.set("event", state.eventId);
    }

    if (
      state.activeTypes.length > 0 &&
      state.activeTypes.length < allEventTypes.length
    ) {
      params.set("types", state.activeTypes.join(","));
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

  const filteredItems = useMemo(
    () => filterItemsByTypes(allItems, state.activeTypes),
    [allItems, state.activeTypes]
  );

  useEffect(() => {
    if (state.eventId && !filteredItems.some((item) => item.id === state.eventId)) {
      setState((current) => ({ ...current, eventId: null }));
    }
  }, [filteredItems, state.eventId]);

  const stats = useMemo(() => getSemesterStats(feed, todayKey), [feed, todayKey]);
  const monthDate = useMemo(() => parseMonthKey(state.monthKey), [state.monthKey]);
  const selectedDate = useMemo(() => parseDateKey(state.dateKey), [state.dateKey]);
  const weekDays = useMemo(() => getWeekDays(state.dateKey), [state.dateKey]);
  const selectedDateItems = useMemo(
    () => getItemsForDate(filteredItems, state.dateKey),
    [filteredItems, state.dateKey]
  );
  const selectedItem = useMemo(
    () =>
      filteredItems.find((item) => item.id === state.eventId) ??
      selectedDateItems[0] ??
      null,
    [filteredItems, selectedDateItems, state.eventId]
  );
  const upcomingItems = useMemo(
    () => getUpcomingItems(filteredItems, state.dateKey, 12),
    [filteredItems, state.dateKey]
  );
  const agendaGroups = useMemo(
    () => buildAgendaGroups(upcomingItems, state.dateKey),
    [upcomingItems, state.dateKey]
  );
  const progressPercent = Math.max(
    0,
    Math.min(100, Math.round((stats.elapsedDays / Math.max(stats.totalDays, 1)) * 100))
  );
  const activeTypeSet = new Set(
    state.activeTypes.length === 0 ? allEventTypes : state.activeTypes
  );

  function setMonth(nextMonthDate: Date) {
    setState((current) => ({
      ...current,
      monthKey: toMonthKey(nextMonthDate),
      dateKey: toDateKey(nextMonthDate),
      eventId: null
    }));
  }

  function selectDate(dateKey: string, nextEventId: string | null = null) {
    setState((current) => ({
      ...current,
      dateKey,
      monthKey: toMonthKey(parseDateKey(dateKey)),
      eventId: nextEventId
    }));
  }

  function selectItem(item: CalendarItem) {
    setState((current) => ({
      ...current,
      dateKey: item.startDate,
      monthKey: toMonthKey(parseDateKey(item.startDate)),
      eventId: item.id
    }));
  }

  function toggleType(type: CalendarEventType) {
    setState((current) => {
      if (current.activeTypes.length === 0) {
        return { ...current, activeTypes: [type], eventId: null };
      }

      const isActive = current.activeTypes.includes(type);
      const nextTypes = isActive
        ? current.activeTypes.filter((value) => value !== type)
        : [...current.activeTypes, type];

      return {
        ...current,
        activeTypes: nextTypes.length === 0 ? [] : nextTypes,
        eventId: null
      };
    });
  }

  function resetFilters() {
    setState((current) => ({ ...current, activeTypes: [], eventId: null }));
  }

  function setView(view: ViewMode) {
    setState((current) => ({ ...current, view }));
  }

  function goToToday() {
    setState((current) => ({
      ...current,
      dateKey: todayKey,
      monthKey: toMonthKey(parseDateKey(todayKey)),
      eventId: null
    }));
  }

  function goToUpcoming() {
    setState((current) => ({
      ...current,
      dateKey: todayKey,
      monthKey: toMonthKey(parseDateKey(todayKey)),
      eventId: null,
      view: "agenda"
    }));
    scrollToSection("upcoming-section");
  }

  async function shareCalendar() {
    const shareUrl = window.location.href;
    const shareData = {
      title: "IPU Calendar Portal",
      text: "Shared from the IPU academic calendar portal.",
      url: shareUrl
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setShareStatus("Shared");
        return;
      }

      await navigator.clipboard.writeText(shareUrl);
      setShareStatus("Link copied");
    } catch {
      setShareStatus("Share cancelled");
    }
  }

  return (
    <div className="pb-24 lg:pb-8">
      <div className="mx-auto max-w-[1600px] px-4 py-4 sm:px-6 lg:px-8">
        <header className="panel surface-grid relative overflow-hidden rounded-[32px] px-5 py-6 sm:px-7 sm:py-8">
          <div className="absolute inset-y-0 right-0 hidden w-80 bg-[radial-gradient(circle_at_center,rgba(29,141,98,0.16),transparent_70%)] lg:block" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center rounded-full bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-600">
                IPU Student Calendar Portal
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
                One visual calendar for classes, exams, holidays, and working days left.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                Built for the way IPU students actually share schedules today: PDFs and
                WhatsApp. This portal keeps the semester visible on web and mobile, with
                shareable deep links and semester progress in one place.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <StatChip label="Semester" value={feed.semester.name} />
                <StatChip
                  label="Working days left"
                  value={`${stats.workingDaysRemaining}`}
                />
                <StatChip label="Holidays left" value={`${stats.holidaysRemaining}`} />
              </div>
            </div>

            <div className="w-full max-w-md rounded-[28px] border border-white/60 bg-white/80 p-4 shadow-panel">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Quick share
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Forward the live portal link in WhatsApp instead of sending the same PDF
                    again and again.
                  </p>
                </div>
                <button
                  onClick={shareCalendar}
                  className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                >
                  Share portal
                </button>
              </div>
              <div className="mt-4 flex items-center justify-between rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                <span>Deep links keep your month, date, and event selected.</span>
                <span className="font-semibold">{shareStatus ?? "Ready"}</span>
              </div>
            </div>
          </div>
        </header>
