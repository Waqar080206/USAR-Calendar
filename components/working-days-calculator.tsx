"use client";

import { useMemo, useState } from "react";
import { addDays, format, isSameDay, parseISO, subDays } from "date-fns";
import { motion, useReducedMotion } from "framer-motion";

import {
  eventTypeMeta,
  getHolidayDateSet,
  getWorkingDayBreakdown,
  toDateKey
} from "@/lib/calendar";
import { CalendarFeed, getSemester } from "@/lib/types";
import { cn } from "@/lib/utils";
import { CountUp } from "./motion-primitives";

interface WorkingDaysCalculatorProps {
  feed: CalendarFeed;
  semesterId: string;
  todayKey: string;
}

export function WorkingDaysCalculator({
  feed,
  semesterId,
  todayKey
}: WorkingDaysCalculatorProps) {
  const prefersReducedMotion = useReducedMotion();
  const semester = useMemo(
    () => getSemester(feed, semesterId),
    [feed, semesterId]
  );

  // Re-seed the range whenever the selected semester changes so the inputs
  // never show dates from the previous term.
  const semesterKey = `${semester.startDate}:${semester.endDate}`;
  const [range, setRange] = useState({
    semesterKey,
    startDate: parseISO(semester.startDate),
    endDate: parseISO(semester.endDate)
  });

  if (range.semesterKey !== semesterKey) {
    setRange({
      semesterKey,
      startDate: parseISO(semester.startDate),
      endDate: parseISO(semester.endDate)
    });
  }

  const { startDate, endDate } = range;
  const setStartDate = (date: Date | null) =>
    setRange((current) => ({ ...current, startDate: date ?? current.startDate }));
  const setEndDate = (date: Date | null) =>
    setRange((current) => ({ ...current, endDate: date ?? current.endDate }));

  const holidayDates = useMemo(() => getHolidayDateSet(feed), [feed]);

  const breakdown = useMemo(() => {
    if (!startDate || !endDate) {
      return null;
    }

    return getWorkingDayBreakdown(
      toDateKey(startDate),
      toDateKey(endDate),
      semester.workingWeekdays,
      holidayDates
    );
  }, [startDate, endDate, semester.workingWeekdays, holidayDates]);

  const previewDates = useMemo(() => {
    if (!startDate) {
      return [];
    }

    const base = isSameDay(startDate, parseISO(todayKey)) ? startDate : parseISO(todayKey);

    return [base, addDays(base, 1), addDays(base, 2), subDays(base, 1)];
  }, [startDate, todayKey]);

  return (
    <section aria-labelledby="working-days-heading" className="panel rounded-3xl p-5 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2
          id="working-days-heading"
          className="text-base font-semibold text-ink"
        >
          Working days calculator
        </h2>
        <p className="text-xs text-ink-subtle">
          Excludes {describeWeekdays(semester.workingWeekdays)} and holidays
        </p>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_auto]">
        <DateField
          id="working-start"
          label="From"
          value={startDate}
          onChange={setStartDate}
        />
        <DateField
          id="working-end"
          label="To"
          value={endDate}
          onChange={setEndDate}
        />

        <div className="flex items-end">
          <motion.button
            type="button"
            onClick={() => {
              setStartDate(parseISO(semester.startDate));
              setEndDate(parseISO(semester.endDate));
            }}
            whileTap={prefersReducedMotion ? undefined : { scale: 0.96 }}
            className="h-[42px] w-full rounded-xl border border-line/70 px-4 text-xs font-semibold text-ink-muted transition-colors hover:border-brand/40 hover:text-brand sm:w-auto"
          >
            Reset to semester
          </motion.button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {previewDates.map((date) => {
          const dateKey = toDateKey(date);
          const isHoliday = holidayDates.has(dateKey);
          const isWorking = semester.workingWeekdays.includes(date.getDay());

          return (
            <span
              key={dateKey}
              className={cn(
                "rounded-lg px-2 py-1 text-[10px] font-semibold tabular-nums",
                isHoliday
                  ? "bg-amber-500/12 text-amber-700 dark:text-amber-300"
                  : isWorking
                    ? "bg-brand/12 text-brand"
                    : "bg-sunken text-ink-subtle"
              )}
            >
              {format(date, "EEE d")}
            </span>
          );
        })}
      </div>

      {breakdown && (
        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <MetricTile
            label="Working days"
            value={breakdown.workingDays}
            tone="brand"
          />
          <MetricTile
            label="Holidays"
            value={breakdown.holidayDays}
            tone="amber"
          />
          <MetricTile
            label="Off days"
            value={breakdown.weekendDays}
            tone="slate"
          />
          <MetricTile
            label="Calendar days"
            value={breakdown.calendarDays}
            tone="sky"
          />
        </div>
      )}
    </section>
  );
}

function describeWeekdays(weekdays: number[]) {
  const names = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const sorted = [...weekdays].sort((a, b) => a - b);

  return sorted.map((day) => names[day]).join(", ");
}

function DateField({
  id,
  label,
  value,
  onChange
}: {
  id: string;
  label: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-[10px] font-bold tracking-[0.14em] text-ink-subtle uppercase"
      >
        {label}
      </label>
      <input
        id={id}
        type="date"
        value={value ? toDateKey(value) : ""}
        onChange={(event) =>
          onChange(event.target.value ? parseISO(event.target.value) : null)
        }
        className="h-[42px] w-full rounded-xl border border-line/70 bg-sunken/60 px-3 text-sm font-medium text-ink transition-colors focus:border-brand/60 focus:bg-surface focus:outline-none"
      />
    </div>
  );
}

function MetricTile({
  label,
  value,
  tone
}: {
  label: string;
  value: number;
  tone: "brand" | "amber" | "slate" | "sky";
}) {
  const toneClass = {
    brand: "text-brand",
    amber: "text-amber-600 dark:text-amber-400",
    slate: "text-ink-muted",
    sky: "text-sky-600 dark:text-sky-400"
  }[tone];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-2xl border border-line/50 bg-sunken/50 px-3 py-3"
    >
      <p className="text-[10px] font-bold tracking-[0.12em] text-ink-subtle uppercase">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 text-2xl font-semibold tabular-nums",
          toneClass
        )}
      >
        <CountUp value={value} />
      </p>
    </motion.div>
  );
}