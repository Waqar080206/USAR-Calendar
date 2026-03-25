export type CalendarEventType =
  | "registration"
  | "class"
  | "exam"
  | "holiday"
  | "break"
  | "deadline"
  | "notice";

export interface SemesterConfig {
  name: string;
  startDate: string;
  endDate: string;
  workingWeekdays: number[];
  timezone: string;
}

export interface CalendarEvent {
  id: string;
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

export interface CalendarFeed {
  semester: SemesterConfig;
  events: CalendarEvent[];
  holidays: Holiday[];
  announcements: Announcement[];
}
