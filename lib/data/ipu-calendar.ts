import { CalendarFeed } from "@/lib/types";

export const ipuCalendarFeed: CalendarFeed = {
  semesters: [
    {
      id: "odd-2026-27",
      name: "Odd Semester 2026-27",
      shortName: "Odd 26-27",
      term: "odd",
      startDate: "2026-08-03",
      endDate: "2027-01-17",
      session: "2026-27",
      workingWeekdays: [1, 2, 3, 4, 5],
      timezone: "Asia/Kolkata"
    },
    {
      id: "even-2026-27",
      name: "Even Semester 2026-27",
      shortName: "Even 26-27",
      term: "even",
      startDate: "2027-01-18",
      endDate: "2027-07-18",
      session: "2026-27",
      workingWeekdays: [1, 2, 3, 4, 5],
      timezone: "Asia/Kolkata"
    }
  ],

  events: [
    {
      id: "odd-2026-27-classes-begin",
      semesterId: "odd-2026-27",
      title: "Commencement of Classes (1st, 3rd, 5th, 7th & 9th Sem)",
      type: "class",
      startDate: "2026-08-03",
      endDate: "2026-08-03",
      allDay: true,
      description:
        "Instruction and laboratory work commence for Odd Semesters (First, Third, Fifth, Seventh and Ninth).",
      source: "Academic Calendar PDF"
    },
    {
      id: "odd-2026-27-instruction",
      semesterId: "odd-2026-27",
      title: "Teaching & Continuous Evaluation (18 weeks)",
      type: "class",
      startDate: "2026-08-03",
      endDate: "2026-12-06",
      allDay: true,
      description:
        "Imparting of instruction and/or laboratory work including continuous evaluation by teachers, semester lab/practical/term paper evaluation and NUES. 18 week duration on a 5 day working week.",
      source: "Academic Calendar PDF"
    },
    {
      id: "odd-2026-27-siah",
      semesterId: "odd-2026-27",
      title: "Smart India Hackathon 2026 - Internal (Tentative)",
      type: "notice",
      startDate: "2026-08-24",
      endDate: "2026-08-25",
      allDay: true,
      description: "Internal Hackathon, tentative dates.",
      source: "Academic Calendar PDF"
    },
    {
      id: "odd-2026-27-synopsis-arp455",
      semesterId: "odd-2026-27",
      title: "Synopsis Submission - ARP 455 (Minor Project)",
      type: "deadline",
      startDate: "2026-09-08",
      endDate: "2026-09-08",
      allDay: true,
      description: "For 7th semester students.",
      source: "Academic Calendar PDF"
    },
    {
      id: "odd-2026-27-induction",
      semesterId: "odd-2026-27",
      title: "Student Induction Program & DSW Srijan Clubs Orientation",
      type: "notice",
      startDate: "2026-09-09",
      endDate: "2026-09-09",
      allDay: true,
      description: "Induction programme for new students.",
      source: "Academic Calendar PDF"
    },
    {
      id: "odd-2026-27-clubs-orientation",
      semesterId: "odd-2026-27",
      title: "Student Clubs of USAR Orientation Program 2026",
      type: "notice",
      startDate: "2026-09-10",
      endDate: "2026-09-10",
      allDay: true,
      description: "Orientation for USAR student clubs.",
      source: "Academic Calendar PDF"
    },
    {
      id: "odd-2026-27-mulaqat",
      semesterId: "odd-2026-27",
      title: "Freshers' Party 2026 - Mulaqat 4.0",
      type: "notice",
      startDate: "2026-09-11",
      endDate: "2026-09-11",
      allDay: true,
      description: "Freshers' celebration for the new batch.",
      source: "Academic Calendar PDF"
    },
    {
      id: "odd-2026-27-midterm-1",
      semesterId: "odd-2026-27",
      title: "Mid-Term Examinations - I",
      type: "exam",
      startDate: "2026-09-21",
      endDate: "2026-09-26",
      allDay: true,
      description: "First mid-term examination period.",
      source: "Academic Calendar PDF"
    },
    {
      id: "odd-2026-27-internal-eval-1",
      semesterId: "odd-2026-27",
      title: "Internal Evaluation - I of ARP 455 (Minor Project Report)",
      type: "exam",
      startDate: "2026-09-29",
      endDate: "2026-09-29",
      allDay: true,
      description: "First internal evaluation for 7th semester minor project.",
      source: "Academic Calendar PDF"
    },
    {
      id: "odd-2026-27-sports-meet",
      semesterId: "odd-2026-27",
      title: "Sports Meet",
      type: "notice",
      startDate: "2026-10-14",
      endDate: "2026-10-16",
      allDay: true,
      description: "Inter-college and intra-university sports meet.",
      source: "Academic Calendar PDF"
    },
    {
      id: "odd-2026-27-elysian",
      semesterId: "odd-2026-27",
      title: "Elysian 2026 & Heritage Fest 2026",
      type: "notice",
      startDate: "2026-10-21",
      endDate: "2026-10-24",
      allDay: true,
      description: "Annual cultural and heritage festival.",
      source: "Academic Calendar PDF"
    },
    {
      id: "odd-2026-27-midterm-2",
      semesterId: "odd-2026-27",
      title: "Mid-Term Examinations - II",
      type: "exam",
      startDate: "2026-11-16",
      endDate: "2026-11-21",
      allDay: true,
      description: "Second mid-term examination period.",
      source: "Academic Calendar PDF"
    },
    {
      id: "odd-2026-27-internal-lab",
      semesterId: "odd-2026-27",
      title: "Internal Lab / Practical Examinations",
      type: "exam",
      startDate: "2026-11-23",
      endDate: "2026-11-27",
      allDay: true,
      description: "Internal laboratory and practical examinations.",
      source: "Academic Calendar PDF"
    },
    {
      id: "odd-2026-27-internal-eval-2",
      semesterId: "odd-2026-27",
      title: "Internal Evaluation - II (ARP 455) & Term End Evaluation",
      type: "exam",
      startDate: "2026-11-24",
      endDate: "2026-11-25",
      allDay: true,
      description:
        "Internal Evaluation - II of ARP 455 (Minor Project Report) and Term End Evaluation of specified subjects / Summer Training Report.",
      source: "Academic Calendar PDF"
    },
    {
      id: "odd-2026-27-term-end-practical",
      semesterId: "odd-2026-27",
      title: "Term End Practical Examinations",
      type: "exam",
      startDate: "2026-11-30",
      endDate: "2026-12-10",
      allDay: true,
      description: "End semester practical examinations.",
      source: "Academic Calendar PDF"
    },
    {
      id: "odd-2026-27-term-end-begins",
      semesterId: "odd-2026-27",
      title: "Term End Examination Period Begins",
      type: "notice",
      startDate: "2026-12-07",
      endDate: "2026-12-07",
      allDay: true,
      description:
        "Broad university calendar: the term end examination period begins.",
      source: "Academic Calendar PDF"
    },
    {
      id: "odd-2026-27-term-end-theory",
      semesterId: "odd-2026-27",
      title: "Term End Theory Examinations (incl. Preparatory Leave)",
      type: "exam",
      startDate: "2026-12-11",
      endDate: "2027-01-03",
      allDay: true,
      description:
        "Term end theory examinations including preparatory leave.",
      source: "Academic Calendar PDF"
    },
    {
      id: "odd-2026-27-winter-vacation",
      semesterId: "odd-2026-27",
      title: "Winter Vacation",
      type: "break",
      startDate: "2027-01-04",
      endDate: "2027-01-17",
      allDay: true,
      description: "Winter vacation for two weeks.",
      source: "Academic Calendar PDF"
    },

    {
      id: "even-2026-27-instruction",
      semesterId: "even-2026-27",
      title: "Teaching & Continuous Evaluation (18 weeks)",
      type: "class",
      startDate: "2027-01-18",
      endDate: "2027-05-23",
      allDay: true,
      description:
        "Imparting of instruction and/or laboratory work including continuous evaluation by teachers, semester lab/practical/term paper evaluation and NUES for Even Semesters (Second, Fourth, Sixth, Eighth and Tenth). 18 week duration on a 5 day working week.",
      source: "Academic Calendar PDF"
    },
    {
      id: "even-2026-27-anugoonj",
      semesterId: "even-2026-27",
      title: "Anugoonj",
      type: "notice",
      startDate: "2027-02-03",
      endDate: "2027-02-05",
      allDay: true,
      description: "Annual cultural festival.",
      source: "Academic Calendar PDF"
    },
    {
      id: "even-2026-27-term-end",
      semesterId: "even-2026-27",
      title: "Term End Examinations (incl. Preparatory Leave)",
      type: "exam",
      startDate: "2027-05-24",
      endDate: "2027-06-20",
      allDay: true,
      description: "Term end examinations including preparatory leave.",
      source: "Academic Calendar PDF"
    },
    {
      id: "even-2026-27-summer-vacation",
      semesterId: "even-2026-27",
      title: "Summer Vacation",
      type: "break",
      startDate: "2027-06-21",
      endDate: "2027-07-18",
      allDay: true,
      description: "Summer vacation.",
      source: "Academic Calendar PDF"
    }
  ],

  holidays: [
    {
      id: "independence-day-2026",
      name: "Independence Day",
      date: "2026-08-15",
      category: "Gazetted Holiday",
      source: "Holiday PDF"
    },
    {
      id: "janmashtami-2026",
      name: "Janmashtami",
      date: "2026-09-04",
      category: "Festival Holiday",
      source: "Holiday PDF"
    },
    {
      id: "mahatma-gandhi-jayanti-2026",
      name: "Gandhi Jayanti",
      date: "2026-10-02",
      category: "Gazetted Holiday",
      source: "Holiday PDF"
    },
    {
      id: "dussehra-2026",
      name: "Dussehra",
      date: "2026-10-20",
      category: "Festival Holiday",
      source: "Holiday PDF"
    },
    {
      id: "valmiki-jayanti-2026",
      name: "Valmiki Jayanti",
      date: "2026-10-26",
      category: "Festival Holiday",
      source: "Holiday PDF"
    },
    {
      id: "diwali-2026",
      name: "Diwali",
      date: "2026-11-08",
      category: "Festival Holiday",
      source: "Holiday PDF"
    },
    {
      id: "guru-nanak-jayanti-2026",
      name: "Guru Nanak Jayanti",
      date: "2026-11-24",
      category: "Festival Holiday",
      source: "Holiday PDF"
    },
    {
      id: "christmas-day-2026",
      name: "Christmas Day",
      date: "2026-12-25",
      category: "Gazetted Holiday",
      source: "Holiday PDF"
    },
    {
      id: "republic-day-2027",
      name: "Republic Day",
      date: "2027-01-26",
      category: "Gazetted Holiday",
      source: "Holiday PDF"
    },
    {
      id: "independence-day-2027",
      name: "Independence Day",
      date: "2027-08-15",
      category: "Gazetted Holiday",
      source: "Holiday PDF"
    }
  ],

  announcements: [
    {
      id: "odd-term-structure",
      title: "Odd Semester 2026-27: instruction 03 Aug to 06 Dec 2026",
      body: "Term end examinations run 07 Dec 2026 to 03 Jan 2027, followed by winter vacation until 17 Jan 2027.",
      source: "Academic Calendar PDF"
    },
    {
      id: "even-term-structure",
      title: "Even Semester 2026-27: instruction 18 Jan to 23 May 2027",
      body: "Term end examinations run 24 May to 20 Jun 2027, followed by summer vacation until 18 Jul 2027.",
      source: "Academic Calendar PDF"
    },
    {
      id: "holidays-2027-pending",
      title: "2027 festival holidays are not published yet",
      body: "Only fixed-date national holidays are listed for 2027. Lunar festival dates will be added once the official gazetted notification is issued.",
      source: "Portal Setup"
    }
  ]
};

