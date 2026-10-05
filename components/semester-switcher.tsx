"use client";

import { motion, useReducedMotion } from "framer-motion";

import { getSemesterForDate } from "@/lib/calendar";
import { CalendarFeed, SemesterConfig } from "@/lib/types";
import { cn } from "@/lib/utils";

interface SemesterSwitcherProps {
  feed: CalendarFeed;
  activeSemester: SemesterConfig;
  todayKey: string;
  onSelect: (semesterId: string) => void;
}

type Status = "live" | "upcoming" | "past";

function getStatus(semester: SemesterConfig, todayKey: string): Status {
  if (todayKey < semester.startDate) {
    return "upcoming";
  }

  if (todayKey > semester.endDate) {
    return "past";
  }

  return "live";
}

const statusLabel: Record<Status, string> = {
  live: "In progress",
  upcoming: "Upcoming",
  past: "Completed"
};

const statusClass: Record<Status, string> = {
  live: "bg-brand/12 text-brand",
  upcoming: "bg-sky-500/12 text-sky-700 dark:text-sky-300",
  past: "bg-sunken text-ink-subtle"
};

export function SemesterSwitcher({
  feed,
  activeSemester,
  todayKey,
  onSelect
}: SemesterSwitcherProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div
      role="tablist"
      aria-label="Semester"
      className="flex flex-wrap items-center gap-1.5"
    >
      {feed.semesters.map((semester) => {
        const isActive = semester.id === activeSemester.id;
        const status = getStatus(semester, todayKey);

        return (
          <motion.button
            key={semester.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelect(semester.id)}
            whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : { type: "spring", stiffness: 420, damping: 30 }
            }
            className={cn(
              "relative flex flex-col items-start gap-0.5 rounded-xl border px-3 py-2 text-left transition-colors",
              isActive
                ? "border-brand/40 bg-brand/10"
                : "border-line/60 bg-surface/50 hover:bg-elevated/70"
            )}
          >
            {isActive && (
              <motion.span
                layoutId="semester-active"
                aria-hidden="true"
                className="absolute inset-0 rounded-xl ring-2 ring-brand/50"
                transition={
                  prefersReducedMotion
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 400, damping: 32 }
                }
              />
            )}

            <span
              className={cn(
                "relative z-10 text-sm font-semibold",
                isActive ? "text-ink" : "text-ink-muted"
              )}
            >
              {semester.shortName}
            </span>

            <span
              className={cn(
                "relative z-10 text-[10px] font-semibold rounded-full px-1.5 py-0.5",
                statusClass[status]
              )}
            >
              {statusLabel[status]}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}

/**
 * Picks the semester a visitor most likely wants: the one containing today,
 * otherwise the next one to start, otherwise the last one that has run.
 */
export function resolveInitialSemesterId(
  feed: CalendarFeed,
  todayKey: string,
  requestedId: string | undefined
) {
  const requested = feed.semesters.find(
    (semester) => semester.id === requestedId
  );

  return (requested ?? getSemesterForDate(feed, todayKey)).id;
}