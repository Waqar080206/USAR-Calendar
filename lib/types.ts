export type CalendarEventType =
  | "registration"
  | "class"
  | "exam"
  | "holiday"
  | "break"
  | "deadline"
  | "notice";

export interface SemesterConfig {
  id: string;
  name: string;
  shortName: string;
  /** Term this semester covers: "odd" or "even". */
  term: "odd" | "even";
  startDate: string;
  endDate: string;
  /** Session label, e.g. "2026-27". */
  session: string;
  workingWeekdays: number[];
  timezone: string;
}

export interface CalendarEvent {
  id: string;
  /** Semester this event belongs to. */
  semesterId: string;
  title: string;
  type: CalendarEventType;
  startDate: string;
  endDate: string;
  allDay: boolean;
  description: string;
  source: string;
}

export interface Holiday {
  id: string;
  name: string;
  date: string;
  category: string;
  source: string;
  description?: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  source: string;
}

export interface SemesterStats {
  totalDays: number;
  elapsedDays: number;
  remainingDays: number;
  workingDaysRemaining: number;
  holidaysRemaining: number;
}

/**
 * The full published feed: every semester plus the calendar-wide holiday list.
 * Holidays are not per-semester because the gazetted list for a year applies
 * regardless of which semester is being viewed.
 */
export interface CalendarFeed {
  /** Newest first. The first entry is the default view. */
  semesters: SemesterConfig[];
  events: CalendarEvent[];
  holidays: Holiday[];
  announcements: Announcement[];
}

/**
 * A single semester resolved out of a {@link CalendarFeed}. Presentation code
 * works with this instead of the full feed so it never has to remember that
 * items need filtering by semester.
 */
export interface SemesterScope {
  semester: SemesterConfig;
  events: CalendarEvent[];
  holidays: Holiday[];
  announcements: Announcement[];
}

export function getSemester(
  feed: CalendarFeed,
  semesterId: string | null | undefined
): SemesterConfig {
  const match = feed.semesters.find(
    (semester) => semester.id === semesterId
  );

  return match ?? feed.semesters[0];
}