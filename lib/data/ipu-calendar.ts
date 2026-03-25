import { CalendarFeed } from "@/lib/types";

export const ipuCalendarFeed: CalendarFeed = {
  semester: {
    name: "USAR Even Semester 2026",
    startDate: "2026-01-16",
    endDate: "2026-07-31",
    workingWeekdays: [1, 2, 3, 4, 5],
    timezone: "Asia/Kolkata"
  },
  events: [
    {
      id: "anugoonj-2026",
      title: "Anugoonj 2026 - Cultural Festival",
      type: "notice",
      startDate: "2026-02-04",
      endDate: "2026-02-06",
      allDay: true,
      description: "25th Annual Cultural Festival",
      source: "USAR Academic Calendar PDF"
    },
    {
      id: "synopsis-submission",
      title: "Synopsis Submission (ARP 452 / ART 454)",
      type: "deadline",
      startDate: "2026-02-18",
      endDate: "2026-02-18",
      allDay: true,
      description: "For 8th semester students",
      source: "USAR Academic Calendar PDF"
    },
    {
      id: "internal-eval-1",
      title: "Internal Evaluation I / Major Project Presentation",
      type: "exam",
      startDate: "2026-03-02",
      endDate: "2026-03-02",
      allDay: true,
      description: "For 8th semester (ARP 452 / ART 454)",
      source: "USAR Academic Calendar PDF"
    },
    {
      id: "midterm-1",
      title: "Mid Term Examination - I",
      type: "exam",
      startDate: "2026-03-09",
      endDate: "2026-03-16",
      allDay: true,
      description: "First mid semester exams",
      source: "USAR Academic Calendar PDF"
    },
    {
      id: "midterm-2",
      title: "Mid Term Examination - II",
      type: "exam",
      startDate: "2026-04-20",
      endDate: "2026-04-27",
      allDay: true,
      description: "Second mid semester exams",
      source: "USAR Academic Calendar PDF"
    },
    {
      id: "genai-summit",
      title: "Prompt Craft: Generative AI Summit 2026",
      type: "notice",
      startDate: "2026-04-06",
      endDate: "2026-04-06",
      allDay: true,
      description: "Designing Intelligence Summit",
      source: "USAR Academic Calendar PDF"
    },
    {
      id: "fdp",
      title: "Faculty Development Program (FDP)",
      type: "notice",
      startDate: "2026-04-20",
      endDate: "2026-04-25",
      allDay: true,
      description: "Faculty training program",
      source: "USAR Academic Calendar PDF"
    },
    {
      id: "internal-eval-2",
      title: "Internal Evaluation II / Major Project Presentation",
      type: "exam",
      startDate: "2026-04-28",
      endDate: "2026-04-28",
      allDay: true,
      description: "For 8th semester",
      source: "USAR Academic Calendar PDF"
    },
    {
      id: "afsan-2",
      title: "Afsana 2.0 - Farewell Ceremony",
      type: "notice",
      startDate: "2026-04-29",
      endDate: "2026-04-29",
      allDay: true,
      description: "Farewell for Batch of 2026",
      source: "USAR Academic Calendar PDF"
    },
    {
      id: "lab-exams",
      title: "Internal Lab / Practical Examinations",
      type: "exam",
      startDate: "2026-05-01",
      endDate: "2026-05-06",
      allDay: true,
      description: "Internal practical exams",
      source: "USAR Academic Calendar PDF"
    },
    {
      id: "term-end-practical",
      title: "Term End Practical Examinations",
      type: "exam",
      startDate: "2026-05-07",
      endDate: "2026-05-21",
      allDay: true,
      description: "Final practical exams",
      source: "USAR Academic Calendar PDF"
    },
    {
      id: "term-end-theory",
      title: "Term End Theory Examinations",
      type: "exam",
      startDate: "2026-05-22",
      endDate: "2026-06-13",
      allDay: true,
      description: "Final theory exams",
      source: "USAR Academic Calendar PDF"
    },
    {
      id: "summer-internship",
      title: "Summer Training / Internship Period",
      type: "break",
      startDate: "2026-06-15",
      endDate: "2026-07-31",
      allDay: true,
      description: "For 4th and 6th semester students",
      source: "USAR Academic Calendar PDF"
    }
  ],
  holidays: [
    {
      id: "republic-day",
      name: "Republic Day",
      date: "2026-01-26",
      category: "Gazetted Holiday",
      source: "USAR Academic Calendar PDF"
    },
    {
      id: "holi",
      name: "Holi",
      date: "2026-03-04",
      category: "Festival Holiday",
      source: "USAR Academic Calendar PDF"
    },
    {
      id: "id-ul-fitr",
      name: "Id-ul-Fitr",
      date: "2026-03-21",
      category: "Festival Holiday",
      source: "USAR Academic Calendar PDF"
    },
    {
      id: "ram-navami",
      name: "Ram Navami",
      date: "2026-03-26",
      category: "Festival Holiday",
      source: "USAR Academic Calendar PDF"
    },
    {
      id: "mahavir-jayanti",
      name: "Mahavir Jayanti",
      date: "2026-03-31",
      category: "Festival Holiday",
      source: "USAR Academic Calendar PDF"
    },
    {
      id: "good-friday",
      name: "Good Friday",
      date: "2026-04-03",
      category: "Gazetted Holiday",
      source: "USAR Academic Calendar PDF"
    },
    {
      id: "buddha-purnima",
      name: "Buddha Purnima",
      date: "2026-05-01",
      category: "Festival Holiday",
      source: "USAR Academic Calendar PDF"
    },
    {
      id: "id-ul-zuha",
      name: "Id-ul-Zuha (Bakrid)",
      date: "2026-05-27",
      category: "Festival Holiday",
      source: "USAR Academic Calendar PDF"
    },
    {
      id: "muharram",
      name: "Muharram",
      date: "2026-06-26",
      category: "Festival Holiday",
      source: "USAR Academic Calendar PDF"
    },
    {
      id: "independence-day",
      name: "Independence Day",
      date: "2026-08-15",
      category: "Gazetted Holiday",
      source: "USAR Academic Calendar PDF"
    },
    {
      id: "milad-un-nabi",
      name: "Milad-un-Nabi",
      date: "2026-08-26",
      category: "Festival Holiday",
      source: "USAR Academic Calendar PDF"
    },
    {
      id: "janmashtami",
      name: "Janmashtami",
      date: "2026-09-04",
      category: "Festival Holiday",
      source: "USAR Academic Calendar PDF"
    },
    {
      id: "gandhi-jayanti",
      name: "Gandhi Jayanti",
      date: "2026-10-02",
      category: "Gazetted Holiday",
      source: "USAR Academic Calendar PDF"
    },
    {
      id: "dussehra",
      name: "Dussehra",
      date: "2026-10-20",
      category: "Festival Holiday",
      source: "USAR Academic Calendar PDF"
    },
    {
      id: "valmiki-jayanti",
      name: "Valmiki Jayanti",
      date: "2026-10-26",
      category: "Festival Holiday",
      source: "USAR Academic Calendar PDF"
    },
    {
      id: "diwali",
      name: "Diwali",
      date: "2026-11-08",
      category: "Festival Holiday",
      source: "USAR Academic Calendar PDF"
    },
    {
      id: "guru-nanak-jayanti",
      name: "Guru Nanak Jayanti",
      date: "2026-11-24",
      category: "Festival Holiday",
      source: "USAR Academic Calendar PDF"
    },
    {
      id: "christmas-day",
      name: "Christmas Day",
      date: "2026-12-25",
      category: "Gazetted Holiday",
      source: "USAR Academic Calendar PDF"
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
