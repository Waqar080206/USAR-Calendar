import { CalendarFeed } from "@/lib/types";

export const ipuCalendarFeed: CalendarFeed = {
  semester: {
    name: "IPU Even Semester 2026",
    startDate: "2026-01-12",
    endDate: "2026-06-15",
    workingWeekdays: [1, 2, 3, 4, 5, 6],
    timezone: "Asia/Kolkata"
  },
  events: [
    {
      id: "orientation-week",
      title: "Orientation and Timetable Briefing",
      type: "notice",
      startDate: "2026-01-12",
      endDate: "2026-01-13",
      allDay: true,
      description:
        "Department-level onboarding, timetable release review, and semester expectations briefing for all enrolled students.",
      source: "Academic Calendar PDF"
    },
    {
      id: "classes-begin",
      title: "Regular Classes Begin",
      type: "class",
      startDate: "2026-01-15",
      endDate: "2026-01-15",
      allDay: true,
      description:
        "Teaching schedule becomes active across all affiliated institutes and schools.",
      source: "Academic Calendar PDF"
    },
    {
      id: "add-drop-window",
      title: "Add or Drop Window",
      type: "registration",
      startDate: "2026-01-15",
      endDate: "2026-01-24",
      allDay: true,
      description:
        "Students can finalize electives, resolve section changes, and close registration corrections.",
      source: "Academic Calendar PDF"
    },
    {
      id: "attendance-advisory",
      title: "Attendance Advisory Review",
      type: "notice",
      startDate: "2026-02-18",
      endDate: "2026-02-18",
      allDay: true,
      description:
        "Advisory checkpoint for low attendance and internal progress review.",
      source: "Academic Calendar PDF"
    },
    {
      id: "internal-assessment-1",
      title: "Internal Assessment I",
      type: "exam",
      startDate: "2026-03-16",
      endDate: "2026-03-21",
      allDay: true,
      description:
        "First internal assessment window across theory and lab components.",
      source: "Academic Calendar PDF"
    },
    {
      id: "mid-sem-break",
      title: "Mid-Semester Break",
      type: "break",
      startDate: "2026-04-06",
      endDate: "2026-04-11",
      allDay: true,
      description: "Teaching pause for the mid-semester break period.",
      source: "Academic Calendar PDF"
    },
    {
      id: "ipu-campus-fest",
      title: "IPU Campus Fest",
      type: "notice",
      startDate: "2026-04-17",
      endDate: "2026-04-18",
      allDay: true,
      description:
        "University-wide cultural and club activities with reduced academic operations.",
      source: "Academic Calendar PDF"
    },
    {
      id: "feedback-window",
      title: "Course Feedback Window",
      type: "deadline",
      startDate: "2026-04-27",
      endDate: "2026-05-02",
      allDay: true,
      description:
        "Students submit course and faculty feedback before final examination scheduling closes.",
      source: "Academic Calendar PDF"
    },
    {
      id: "practical-exams",
      title: "Practical Examinations",
      type: "exam",
      startDate: "2026-05-18",
      endDate: "2026-05-23",
      allDay: true,
      description: "Lab practicals and viva evaluations for eligible courses.",
      source: "Academic Calendar PDF"
    },
    {
      id: "end-sem-exams",
      title: "End-Semester Examinations",
      type: "exam",
      startDate: "2026-05-25",
      endDate: "2026-06-10",
      allDay: true,
      description:
        "Theory examination period for the semester. Final room allocation and admit cards are expected separately.",
      source: "Academic Calendar PDF"
    },
    {
      id: "re-registration",
      title: "Next Semester Re-Registration",
      type: "registration",
      startDate: "2026-06-12",
      endDate: "2026-06-15",
      allDay: true,
      description:
        "Window to confirm the next semester and clear remaining portal actions.",
      source: "Academic Calendar PDF"
    }
  ],
  holidays: [
    {
      id: "republic-day",
      name: "Republic Day",
      date: "2026-01-26",
      category: "Gazetted Holiday",
      source: "Holiday List PDF",
      description: "Official university closure."
    },
    {
      id: "festival-holiday",
      name: "Festival Holiday",
      date: "2026-03-04",
      category: "University Holiday",
      source: "Holiday List PDF",
      description:
        "Placeholder holiday entry for the MVP seed data. Replace with the official PDF value."
    },
    {
      id: "special-closure",
      name: "Special Closure",
      date: "2026-03-20",
      category: "University Holiday",
      source: "Holiday List PDF",
      description:
        "Seed entry representing a university-wide holiday pulled from the holiday PDF."
    },
    {
      id: "good-friday",
      name: "Good Friday",
      date: "2026-04-03",
      category: "Gazetted Holiday",
      source: "Holiday List PDF",
      description: "Official university closure."
    },
    {
      id: "ambedkar-jayanti",
      name: "Ambedkar Jayanti",
      date: "2026-04-14",
      category: "Gazetted Holiday",
      source: "Holiday List PDF",
      description: "Official university closure."
    },
    {
      id: "labour-day",
      name: "Labour Day",
      date: "2026-05-01",
      category: "Gazetted Holiday",
      source: "Holiday List PDF",
      description: "Official university closure."
    }
  ],
  announcements: [
    {
      id: "seed-data-note",
      title: "Replace the sample dates with official PDFs",
      body: "The portal is wired for manual updates. Edit the structured feed in lib/data/ipu-calendar.ts whenever the academic or holiday PDF changes.",
      source: "Portal Setup"
    },
    {
      id: "share-link",
      title: "Share the portal link instead of forwarding PDFs",
      body: "Students can keep one live URL in WhatsApp groups and open the same month, date, and event state on any device.",
      source: "Portal Setup"
    },
    {
      id: "working-days",
      title: "Working days exclude Sundays and holiday dates",
      body: "The default MVP configuration treats Monday to Saturday as working days, which matches the current seed semester setup.",
      source: "Portal Setup"
    }
  ]
};
