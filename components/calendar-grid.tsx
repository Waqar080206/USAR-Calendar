"use client";

import { KeyboardEvent, ReactNode, useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";

import {
  CalendarItem,
  eventTypeMeta,
  getDisplayRange,
  getDurationLabel,
  getItemsByDateKey,
  getItemsForDate,
  getMonthWeeks,
  getWeekDays,
  isWorkingDayKey,
  parseDateKey,
  toDateKey,
  toMonthKey
} from "@/lib/calendar";
import { SemesterScope } from "@/lib/types";
import { cn } from "@/lib/utils";

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const maxCellEvents = 3;

export type CalendarView = "month" | "week" | "agenda";

interface CalendarGridProps {
  scope: SemesterScope;
  items: CalendarItem[];
  selectedDateKey: string;
  monthKey: string;
  view: CalendarView;
  todayKey: string;
  onSelectDate: (dateKey: string) => void;
}

export function CalendarGrid({
  scope,
  items,
  selectedDateKey,
  monthKey,
  view,
  todayKey,
  onSelectDate
}: CalendarGridProps) {
  const itemsByDate = useMemo(() => getItemsByDateKey(items), [items]);

  if (view === "week") {
    return (
      <WeekView
        scope={scope}
        itemsByDate={itemsByDate}
        selectedDateKey={selectedDateKey}
        todayKey={todayKey}
        onSelectDate={onSelectDate}
      />
    );
  }

  if (view === "agenda") {
    return (
      <AgendaView items={items} todayKey={todayKey} onSelectDate={onSelectDate} />
    );
  }

  return (
    <MonthView
      scope={scope}
      itemsByDate={itemsByDate}
      monthKey={monthKey}
      selectedDateKey={selectedDateKey}
      todayKey={todayKey}
      onSelectDate={onSelectDate}
    />
  );
}

interface MonthViewShared {
  scope: SemesterScope;
  itemsByDate: Map<string, CalendarItem[]>;
  holidayDates: Set<string>;
  monthKey: string;
  selectedDateKey: string;
  todayKey: string;
  onSelectDate: (dateKey: string) => void;
  reduceMotion: boolean;
}

function MonthView({
  scope,
  itemsByDate,
  monthKey,
  selectedDateKey,
  todayKey,
  onSelectDate
}: {
  scope: SemesterScope;
  itemsByDate: Map<string, CalendarItem[]>;
  monthKey: string;
  selectedDateKey: string;
  todayKey: string;
  onSelectDate: (dateKey: string) => void;
}) {
  const prefersReducedMotion = useReducedMotion();
  const gridDays = useMemo(() => getMonthWeeks(monthKey).flat(), [monthKey]);
  const monthDays = useMemo(
    () => gridDays.filter((day) => toMonthKey(day) === monthKey),
    [gridDays, monthKey]
  );
  const holidayDates = useMemo(
    () => new Set(scope.holidays.map((holiday) => holiday.date)),
    [scope.holidays]
  );

  const shared = {
    scope,
    itemsByDate,
    holidayDates,
    monthKey,
    selectedDateKey,
    todayKey,
    onSelectDate,
    reduceMotion: Boolean(prefersReducedMotion)
  };

  return (
    <>
      {/* Desktop / tablet: days across the top, weeks stacked downwards. */}
      <div role="grid" aria-label="Month view" className="hidden sm:block">
        <WeekdayHeader />

        <div className="grid grid-cols-7">
          {gridDays.map((day, index) => (
            <MonthCell key={toDateKey(day)} day={day} index={index} {...shared} />
          ))}
        </div>
      </div>

      {/* Mobile: one row per date, dates reading downwards. */}
      <div role="list" aria-label="Month view" className="flex flex-col sm:hidden">
        {monthDays.map((day, index) => (
          <MonthListRow key={toDateKey(day)} day={day} index={index} {...shared} />
        ))}
      </div>
    </>
  );
}

function MonthCell({
  day,
  index,
  scope,
  itemsByDate,
  holidayDates,
  monthKey,
  selectedDateKey,
  todayKey,
  onSelectDate,
  reduceMotion
}: MonthViewShared & { day: Date; index: number }) {
  const dateKey = toDateKey(day);
  const dayItems = itemsByDate.get(dateKey) ?? [];
  const isHoliday = holidayDates.has(dateKey);
  const isWorking = isWorkingDayKey(
    dateKey,
    scope.semester.workingWeekdays,
    holidayDates
  );
  const inMonth = toMonthKey(day) === monthKey;
  const isSelected = dateKey === selectedDateKey;

  return (
    <motion.button
      type="button"
      role="gridcell"
      aria-selected={isSelected}
      aria-label={`${day.toDateString()}${inMonth ? "" : ", adjacent month"}${
        dayItems.length > 0
          ? `, ${dayItems.length} event${dayItems.length > 1 ? "s" : ""}`
          : ""
      }`}
      onClick={() => onSelectDate(dateKey)}
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
      animate={{ opacity: inMonth ? 1 : 0.45, y: 0 }}
      transition={{
        duration: reduceMotion ? 0.15 : 0.4,
        delay: reduceMotion ? 0 : Math.min(index * 0.012, 0.3),
        ease: [0.16, 1, 0.3, 1]
      }}
      whileTap={reduceMotion ? undefined : { scale: 0.97 }}
      className={cn(
        "group relative flex min-h-[122px] flex-col gap-1.5 overflow-hidden border-r border-b border-line/50 p-2.5 text-left transition-colors hover:bg-elevated/70 focus-visible:z-20",
        isSelected && "bg-elevated"
      )}
    >
      {isSelected && (
        <motion.span
          layoutId="selected-date-ring"
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10 ring-2 ring-brand/70 ring-inset"
          transition={
            reduceMotion
              ? { duration: 0 }
              : { type: "spring", stiffness: 380, damping: 32 }
          }
        />
      )}

      <div className="flex items-start justify-between gap-1">
        <DayNumber
          day={day}
          isToday={dateKey === todayKey}
          isHoliday={isHoliday}
        />
        {!isWorking && !isHoliday && (
          <span className="mt-1 text-[9px] font-semibold tracking-wide text-ink-subtle uppercase">
            Off
          </span>
        )}
      </div>

      <CellEvents items={dayItems} />
    </motion.button>
  );
}

function MonthListRow({
  day,
  index,
  scope,
  itemsByDate,
  holidayDates,
  selectedDateKey,
  todayKey,
  onSelectDate,
  reduceMotion
}: MonthViewShared & { day: Date; index: number }) {
  const dateKey = toDateKey(day);
  const dayItems = itemsByDate.get(dateKey) ?? [];
  const isHoliday = holidayDates.has(dateKey);
  const isWorking = isWorkingDayKey(
    dateKey,
    scope.semester.workingWeekdays,
    holidayDates
  );
  const isSelected = dateKey === selectedDateKey;
  const isToday = dateKey === todayKey;
  const hasEvents = dayItems.length > 0;

  return (
    <motion.button
      type="button"
      role="listitem"
      aria-pressed={isSelected}
      aria-label={`${day.toDateString()}${
        hasEvents ? `, ${dayItems.length} event${dayItems.length > 1 ? "s" : ""}` : ""
      }`}
      onClick={() => onSelectDate(dateKey)}
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: reduceMotion ? 0.15 : 0.35,
        delay: reduceMotion ? 0 : Math.min(index * 0.018, 0.3),
        ease: [0.16, 1, 0.3, 1]
      }}
      whileTap={reduceMotion ? undefined : { scale: 0.99 }}
      className={cn(
        "flex items-start gap-3 border-b border-line/50 px-3 py-2.5 text-left transition-colors",
        isSelected ? "bg-elevated" : hasEvents ? "bg-surface/50" : "bg-transparent",
        !hasEvents && !isSelected && !isToday && "opacity-70"
      )}
    >
      <span className="flex w-11 shrink-0 flex-col items-center gap-0.5 pt-0.5">
        <span
          className={cn(
            "text-[9px] font-bold tracking-wide uppercase",
            isHoliday ? "text-amber-600 dark:text-amber-400" : "text-ink-subtle"
          )}
        >
          {weekdayLabels[day.getDay()]}
        </span>
        <DayNumber
          day={day}
          isToday={isToday}
          isHoliday={isHoliday}
          size="lg"
        />
      </span>

      <span className="flex min-w-0 flex-1 flex-col gap-1">
        {!isWorking && !isHoliday && (
          <span className="text-[9px] font-semibold tracking-wide text-ink-subtle uppercase">
            Non-working
          </span>
        )}

        {hasEvents ? (
          dayItems.map((item: CalendarItem) => {
            const meta = eventTypeMeta[item.type];

            return (
              <span
                key={item.id}
                className={cn(
                  "flex min-w-0 items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-semibold leading-tight ring-1 ring-inset",
                  meta.chipClass
                )}
              >
                <span
                  className={cn("h-1.5 w-1.5 shrink-0 rounded-full", meta.accentClass)}
                  aria-hidden="true"
                />
                <span className="truncate">{item.title}</span>
              </span>
            );
          })
        ) : (
          <span className="text-[11px] text-ink-subtle">No events</span>
        )}
      </span>
    </motion.button>
  );
}

function CellEvents({ items }: { items: CalendarItem[] }) {
  const prefersReducedMotion = useReducedMotion();
  const visible = items.slice(0, maxCellEvents);
  const overflow = items.length - visible.length;

  return (
    <div className="flex min-w-0 flex-col gap-1">
      {visible.map((item, index) => {
        const meta = eventTypeMeta[item.type];
        const isRange = item.startDate !== item.endDate;

        return (
          <motion.span
            key={item.id}
            layout
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: prefersReducedMotion ? 0.15 : 0.3,
              delay: prefersReducedMotion ? 0 : index * 0.04,
              ease: [0.16, 1, 0.3, 1]
            }}
            className={cn(
              "flex min-w-0 items-center gap-1 truncate rounded-md px-1.5 py-1 text-[10px] font-semibold leading-tight ring-1 ring-inset transition-transform sm:text-[11px]",
              meta.chipClass,
              !prefersReducedMotion && "group-hover:translate-x-0.5"
            )}
          >
            <span
              className={cn("h-1.5 w-1.5 shrink-0 rounded-full", meta.accentClass)}
              aria-hidden="true"
            />
            <span className="truncate">{item.title}</span>
            {isRange && (
              <span className="ml-auto shrink-0 opacity-60" aria-hidden="true">
                …
              </span>
            )}
          </motion.span>
        );
      })}

      {overflow > 0 && (
        <span className="px-1 text-[10px] font-semibold text-ink-subtle">
          +{overflow} more
        </span>
      )}
    </div>
  );
}

function DayNumber({
  day,
  isToday,
  isHoliday,
  size = "sm"
}: {
  day: Date;
  isToday: boolean;
  isHoliday: boolean;
  size?: "sm" | "lg";
}) {
  const isWeekend = day.getDay() === 0 || day.getDay() === 6;

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full font-semibold tabular-nums transition-colors",
        size === "lg" ? "h-8 w-8 text-base" : "h-6 min-w-6 px-1.5 text-sm",
        isToday
          ? "bg-brand text-brand-ink shadow-lift"
          : isHoliday
            ? "text-amber-700 dark:text-amber-300"
            : isWeekend
              ? "text-ink-subtle"
              : "text-ink"
      )}
    >
      {day.getDate()}
    </span>
  );
}

function WeekdayHeader() {
  return (
    <div
      role="row"
      className="grid grid-cols-7 border-b border-line/50 bg-surface/60"
    >
      {weekdayLabels.map((label, index) => (
        <div
          key={label}
          role="columnheader"
          className={cn(
            "px-2 py-2.5 text-center text-[10px] font-bold tracking-[0.16em] text-ink-subtle uppercase",
            index === 0 || index === 6
              ? "text-rose-500/70 dark:text-rose-400/70"
              : ""
          )}
        >
          {label}
        </div>
      ))}
    </div>
  );
}

function WeekView({
  scope,
  itemsByDate,
  selectedDateKey,
  todayKey,
  onSelectDate
}: {
  scope: SemesterScope;
  itemsByDate: Map<string, CalendarItem[]>;
  selectedDateKey: string;
  todayKey: string;
  onSelectDate: (dateKey: string) => void;
}) {
  const prefersReducedMotion = useReducedMotion();
  const days = useMemo(() => getWeekDays(selectedDateKey), [selectedDateKey]);
  const holidayDates = useMemo(
    () => new Set(scope.holidays.map((holiday) => holiday.date)),
    [scope.holidays]
  );

  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl bg-line/40 sm:grid-cols-7">
        {days.map((day, index) => {
          const dateKey = toDateKey(day);
          const dayItems = itemsByDate.get(dateKey) ?? [];
          const isHoliday = holidayDates.has(dateKey);
          const isWorking = isWorkingDayKey(
            dateKey,
            scope.semester.workingWeekdays,
            holidayDates
          );
          const isToday = dateKey === todayKey;
          const isSelected = dateKey === selectedDateKey;

          return (
            <motion.div
              key={dateKey}
              role="button"
              tabIndex={0}
              aria-pressed={isSelected}
              onClick={() => onSelectDate(dateKey)}
              onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelectDate(dateKey);
                }
              }}
              initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: prefersReducedMotion ? 0.15 : 0.4,
                delay: prefersReducedMotion ? 0 : index * 0.045,
                ease: [0.16, 1, 0.3, 1]
              }}
              className={cn(
                "relative flex min-h-[168px] cursor-pointer flex-col gap-2 bg-surface p-3 transition-colors hover:bg-elevated sm:min-h-[300px] sm:p-3.5",
                isSelected && "bg-elevated"
              )}
            >
              {isSelected && (
                <motion.span
                  layoutId="week-selected"
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 ring-2 ring-brand/60 ring-inset"
                  transition={
                    prefersReducedMotion
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 380, damping: 32 }
                  }
                />
              )}

              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[10px] font-bold tracking-[0.14em] text-ink-subtle uppercase">
                  {weekdayLabels[day.getDay()]}
                </span>
                <DayNumber
                  day={day}
                  isToday={isToday}
                  isHoliday={isHoliday}
                />
              </div>

              {!isWorking && (
                <span className="w-fit rounded-full bg-sunken px-1.5 py-0.5 text-[9px] font-semibold text-ink-subtle">
                  {isHoliday ? "Holiday" : "Non-working"}
                </span>
              )}

              <div className="flex min-w-0 flex-col gap-1">
                {dayItems.map((item) => {
                  const meta = eventTypeMeta[item.type];

                  return (
                    <motion.span
                      key={item.id}
                      layout
                      initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        duration: prefersReducedMotion ? 0.15 : 0.32,
                        ease: [0.16, 1, 0.3, 1]
                      }}
                      className={cn(
                        "rounded-lg px-2 py-1.5 text-[10px] font-semibold leading-snug ring-1 ring-inset sm:text-xs",
                        meta.chipClass
                      )}
                    >
                      {item.title}
                    </motion.span>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function AgendaView({
  items,
  todayKey,
  onSelectDate
}: {
  items: CalendarItem[];
  todayKey: string;
  onSelectDate: (dateKey: string) => void;
}) {
  const prefersReducedMotion = useReducedMotion();
  const today = parseDateKey(todayKey);

  const groups = useMemo(() => {
    const byDate = new Map<string, CalendarItem[]>();

    items.forEach((item) => {
      const start = parseDateKey(item.startDate);
      const key = start < today ? todayKey : item.startDate;
      const bucket = byDate.get(key) ?? [];
      bucket.push(item);
      byDate.set(key, bucket);
    });

    return Array.from(byDate.entries()).sort(([left], [right]) =>
      left.localeCompare(right)
    );
  }, [items, today, todayKey]);

  if (groups.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-line/70 px-6 py-16 text-center">
        <p className="text-sm font-medium text-ink-muted">
          No upcoming events match your filters.
        </p>
      </div>
    );
  }

  return (
    <ol className="flex flex-col gap-2">
      {groups.map(([dateKey, groupItems], groupIndex) => (
        <motion.li
          key={dateKey}
          layout
          initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: prefersReducedMotion ? 0.15 : 0.42,
            delay: prefersReducedMotion ? 0 : Math.min(groupIndex * 0.05, 0.3),
            ease: [0.16, 1, 0.3, 1]
          }}
          className="flex flex-col gap-2 sm:flex-row sm:gap-4"
        >
          <button
            type="button"
            onClick={() => onSelectDate(dateKey)}
            className="flex shrink-0 items-center gap-2 rounded-xl border border-line/60 bg-surface/70 px-3 py-2 text-left transition-colors hover:bg-elevated sm:w-40 sm:flex-col sm:items-start sm:gap-0.5"
          >
            <span className="text-[10px] font-bold tracking-[0.14em] text-ink-subtle uppercase">
              {weekdayLabels[parseDateKey(dateKey).getDay()]}
            </span>
            <span className="text-sm font-semibold text-ink">
              {parseDateKey(dateKey).getDate()}{" "}
              {parseDateKey(dateKey).toLocaleString("en-US", { month: "short" })}
            </span>
          </button>

          <div className="flex min-w-0 flex-1 flex-col gap-2">
            {groupItems.map((item) => (
              <AgendaRow key={item.id} item={item} onSelectDate={onSelectDate} />
            ))}
          </div>
        </motion.li>
      ))}
    </ol>
  );
}

function AgendaRow({
  item,
  onSelectDate
}: {
  item: CalendarItem;
  onSelectDate: (dateKey: string) => void;
}) {
  const prefersReducedMotion = useReducedMotion();
  const meta = eventTypeMeta[item.type];

  return (
    <motion.button
      type="button"
      layout
      onClick={() => onSelectDate(item.startDate)}
      whileHover={prefersReducedMotion ? undefined : { x: 3 }}
      transition={
        prefersReducedMotion
          ? { duration: 0 }
          : { type: "spring", stiffness: 400, damping: 34 }
      }
      className="group relative flex min-w-0 items-start gap-3 overflow-hidden rounded-2xl border border-line/60 bg-surface/70 p-3 text-left transition-colors hover:border-line-strong/25 hover:bg-elevated sm:p-4"
    >
      <span
        className={cn(
          "absolute inset-y-0 left-0 w-1 rounded-l-2xl",
          meta.accentClass
        )}
        aria-hidden="true"
      />

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase ring-1 ring-inset",
              meta.chipClass
            )}
          >
            {meta.label}
          </span>
          <span className="text-[11px] font-medium text-ink-subtle">
            {getDisplayRange(item)}
          </span>
          <span className="text-[11px] font-medium text-ink-subtle">
            {getDurationLabel(item)}
          </span>
        </div>

        <h4 className="truncate text-sm font-semibold text-ink sm:text-[15px]">
          {item.title}
        </h4>

        {item.description && (
          <p className="line-clamp-2 text-xs leading-relaxed text-ink-muted">
            {item.description}
          </p>
        )}
      </div>
    </motion.button>
  );
}
