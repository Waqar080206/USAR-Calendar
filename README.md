# USAR Calendar Portal

A premium academic calendar for visualizing classes, exams, holidays, and deadlines, with month/week/agenda views, shareable deep links, a working days calculator, dark mode, and motion design. Built with **Next.js 14**, **React 18**, **TypeScript**, **Tailwind CSS**, and **Framer Motion**.

**Published Semesters:** USAR Odd Semester 2026-27 (Aug 3, 2026 - Jan 17, 2027) and Even Semester 2026-27 (Jan 18 - Jul 18, 2027). Visitors land on whichever term contains today and can switch with the semester tabs.

## Features

- 📅 **Three Views** - Month grid, week strip, and agenda list, with directional slide transitions between them
- 🔀 **Semester Switcher** - Odd/even term tabs that resolve the whole portal (grid, stats, progress, calculator) to the selected term
- 🎨 **Color-Coded Events** - Seven event types, each with a chip, accent dot, and gradient
- 🌗 **Dark Mode** - System-aware light/dark/auto toggle, persisted, no flash on load
- ✨ **Motion Design** - Spring transitions, layout animations, animated progress and count-ups, all respecting `prefers-reduced-motion`
- 🔗 **Deep Links** - Month, date, view, event, and filters all sync to the URL for sharing
- 🧮 **Working Days Calculator** - Counts working days, holidays, and off days for any range
- 📊 **Semester Progress** - Elapsed/remaining days, working days left, and a per-type month breakdown
- 🎛️ **Type Filters** - Toggle event types, with live counts per type
- 📱 **Responsive** - Month view stays a month on mobile, but as a readable vertical date list instead of a cramped 7-column grid

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The calendar will be available at **`http://localhost:3000`**

### Build for Production

```bash
# Create optimized production build
npm run build

# Start production server
npm start
```

## Project Structure

```
.
├── app/
│   ├── page.tsx                  # Server entry, reads searchParams for deep links
│   ├── layout.tsx                # Root layout, metadata, theme no-flash script
│   └── globals.css               # Semantic color tokens, dark mode, base styles
├── components/
│   ├── simple-calendar.tsx       # Main shell: state, deep links, layout
│   ├── calendar-grid.tsx         # Month / week / agenda views + filter chips
│   ├── semester-switcher.tsx     # Odd/even term tabs + default term resolution
│   ├── motion-primitives.tsx     # Reveal, Stagger, Panel, ViewTransition, CountUp
│   ├── working-days-calculator.tsx
│   └── theme-toggle.tsx
├── lib/
│   ├── calendar.ts               # Pure date logic (no React)
│   ├── theme.ts                  # Theme preference + no-flash script
│   ├── types.ts
│   ├── utils.ts
│   └── data/
│       └── ipu-calendar.ts       # Hardcoded semester, event and holiday data
├── __tests__/
│   └── calendar-utils.test.ts    # 67 tests over lib/calendar.ts
├── package.json
├── tsconfig.json
└── tailwind.config.ts
```

### Design system

Colors are defined once as CSS custom properties in `app/globals.css` and exposed
to Tailwind as semantic tokens: `canvas`, `surface`, `elevated`, `sunken`, `line`,
`ink`, `ink-muted`, `ink-subtle`, `brand`. Dark mode flips the variables, so no
component needs a separate dark palette. Prefer these tokens over raw Tailwind
colors in new UI.

## How It Works

### Calendar Display

The calendar shows:
- **Flat 7-column month grid** on desktop and tablet, weekday names across the top
- **Vertical date list** on mobile, still month-scoped, so dates read downward instead of being squeezed
- **Adjacent month dates** dimmed
- **Today** marked with a filled brand pill
- **Selected date** ring that springs between cells
- **Event chips** per date (up to 3, with "+X more")
- **Non-working days** labelled so weekends and holidays are obvious

### Event Types & Colors

| Type | Color | Use Case |
|------|-------|----------|
| **Exam** | 🔴 Rose | Exams & assessments |
| **Holiday** | 🟡 Amber | National/local holidays |
| **Deadline** | 🟠 Orange | Assignment/project deadlines |
| **Class** | 🔵 Sky | Regular classes & lectures |
| **Registration** | 🟢 Emerald | Course/exam registration periods |
| **Break** | 🟣 Violet | Holiday/semester breaks |
| **Notice** | ⚪ Slate | General notices & announcements |

### Deep links

The URL is the source of truth for shareable state:

```
/?sem=odd-2026-27&month=2026-11&date=2026-11-18&view=week&event=odd-2026-27-midterm-2&types=exam,holiday
```

| Param | Values |
|-------|--------|
| `sem` | Semester id, e.g. `odd-2026-27` |
| `month` | `YYYY-MM` |
| `date` | `YYYY-MM-DD` |
| `view` | `month` \| `week` \| `agenda` |
| `event` | Event id |
| `types` | Comma-separated event types |

Invalid values fall back to today / month view rather than erroring. An unknown `sem`
falls back to the term containing today, then to the most recent one that has started.

### Event Data Structure

Events are defined in `lib/data/ipu-calendar.ts` and each one names the semester it
belongs to via `semesterId`:

```typescript
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
}
```

Holidays are deliberately **not** scoped to a semester: the gazetted list for a year
applies to every term, so `holidays` stays a single calendar-wide array.

**Date Format:** `YYYY-MM-DD` (ISO 8601)

**Event Types:** `"exam" | "holiday" | "deadline" | "class" | "registration" | "break" | "notice"`

## Adding Events

### Method 1: Direct Code Entry (Current)

Edit `lib/data/ipu-calendar.ts` and add entries to `events` (or `holidays`):

```typescript
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
      workingWeekdays: [1, 2, 3, 4, 5], // 0=Sun ... 6=Sat (Mon-Fri)
      timezone: "Asia/Kolkata"
    }
    // Add more semesters here, newest first
  ],
  events: [
    {
      id: "event-1",
      semesterId: "odd-2026-27",
      title: "Event Title",
      type: "class",
      startDate: "2026-11-16",
      endDate: "2026-11-21",
      allDay: true,
      description: "Event description",
      source: "Calendar PDF"
    }
    // Add more events here
  ],
  holidays: [ /* ... */ ],       // calendar-wide, not per semester
  announcements: [ /* ... */ ]
}
```

### Method 2: From PDF (Future Enhancement)

To extract events from PDF files:

1. Convert PDF text to structured format
2. Parse dates and event information
3. Add to `lib/data/ipu-calendar.ts`

Example PDF → Data mapping:
```
Regular Classes Begin - January 15, 2026
↓
→ type: "class", startDate: "2026-01-15"
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (hot reload) |
| `npm run build` | Create production build |
| `npm start` | Run production server |
| `npm run typecheck` | Run TypeScript type checking |
| `npm test` | Run unit tests (67 tests) |

## Technology Stack

- **Framework:** Next.js 14.2
- **Runtime:** Node.js 18+
- **Language:** TypeScript 5.7
- **UI Styling:** Tailwind CSS 3.4 with semantic color tokens
- **Animation:** Framer Motion 14
- **Date Handling:** date-fns 3.6
- **Tests:** node:test with tsx
- **Build Tool:** Webpack (via Next.js)

## Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Customization

### Change Semester Details

Edit the matching entry in `semesters` inside `lib/data/ipu-calendar.ts`:

```typescript
{
  id: "odd-2026-27",           // also the value used by the ?sem= deep link
  name: "Odd Semester 2026-27",
  shortName: "Odd 26-27",      // label on the switcher tab
  term: "odd",
  startDate: "2026-08-03",
  endDate: "2027-01-17",
  session: "2026-27",
  workingWeekdays: [1, 2, 3, 4, 5], // 0=Sun, 1=Mon, ..., 6=Sat (Mon-Fri = 5 days/week)
  timezone: "Asia/Kolkata"
}
```

Order the array newest-first: the first entry is the fallback when no `?sem=` is given
and no term contains today.

### Change Colors

Edit `eventTypeMeta` in `lib/calendar.ts`. Each entry carries a chip, an accent dot,
a selected surface, an outline, and a gradient:

```typescript
exam: {
  label: "Exam",
  shortLabel: "Exam",
  accentClass: "bg-rose-500",
  chipClass: "bg-rose-100 text-rose-900 ring-rose-600/15 dark:bg-rose-400/15 dark:text-rose-200",
  surfaceClass: "bg-rose-50/90 text-rose-950 dark:bg-rose-400/12 dark:text-rose-100",
  outlineClass: "border-rose-500/30 bg-rose-500/8 text-rose-800 dark:text-rose-200",
  gradientClass: "from-rose-400 to-rose-600"
}
```

### Change Global Theming

Semantic tokens live in `app/globals.css` under `:root` and `.dark`. Adjust the RGB
triples to retheme the whole app without touching components.

### Working Days

`workingWeekdays` in `lib/data/ipu-calendar.ts` is the single source of truth, where
`0` is Sunday. `isWorkingDayKey()` applies it, so the header stat and the calculator
can never disagree. Holidays are always excluded, and a holiday wins over a weekend
so the breakdown buckets never double count.

## Performance

- **First Load JS:** ~155 KB (up from ~98 KB before the redesign; framer-motion adds ~35 KB gzipped)
- **Server Rendered:** deep-link state renders on the server, no flash
- **No external APIs:** all data is bundled, works offline
- **Reduced Motion:** `prefers-reduced-motion` disables transforms and springs throughout

## Troubleshooting

### Port 3000 Already in Use

```bash
# Windows: Kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :3000
kill -9 <PID>
```

### Type Errors

```bash
npm run typecheck
```

### Cache Issues

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules
npm install
```

## Future Enhancements

- [ ] PDF upload & parsing (`pdf-parse` / `pdfjs-dist` are already installed)
- [ ] Event CRUD operations (add/edit/delete)
- [x] Multiple semester support
- [ ] Export to Google Calendar / iCal
- [ ] Email notifications for upcoming events
- [ ] Keyboard grid navigation (arrow keys between dates)

## License

MIT License - Feel free to use this for any purpose.

## Contributing

To improve this calendar:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Support

For issues or questions:
- 📧 Create an issue in the repository
- 💬 Check existing documentation
- 🐛 Report bugs with steps to reproduce

---

## Current Calendar Events (2026-27 Session)

### Odd Semester 2026-27 (Aug 3, 2026 - Jan 17, 2027)

- **Instruction (18 weeks, 5-day week):** Aug 3 - Dec 6, 2026
- **Smart India Hackathon 2026 (internal, tentative):** Aug 24-25, 2026
- **Mid-Term I:** Sep 21-26, 2026
- **Sports Meet:** Oct 14-16, 2026
- **Elysian 2026 & Heritage Fest:** Oct 21-24, 2026
- **Mid-Term II:** Nov 16-21, 2026
- **Internal Lab / Practical Exams:** Nov 23-27, 2026
- **Term End Practical Exams:** Nov 30 - Dec 10, 2026
- **Term End Theory (incl. preparatory leave):** Dec 11, 2026 - Jan 3, 2027
- **Winter Vacation:** Jan 4-17, 2027

### Even Semester 2026-27 (Jan 18 - Jul 18, 2027)

- **Instruction (18 weeks, 5-day week):** Jan 18 - May 23, 2027
- **Anugoonj:** Feb 3-5, 2027
- **Term End Examinations (incl. preparatory leave):** May 24 - Jun 20, 2027
- **Summer Vacation:** Jun 21 - Jul 18, 2027

### Holidays

Only dates that are fixed or already gazetted are listed. Lunar 2027 festivals are
deliberately left out until the official notification is issued, so add them to
`holidays` once published rather than guessing.

---

**Built for USAR Students** 🎓  
*Making academic calendars simple, visual, and accessible.*

---

## Support This Project

If you find this calendar useful, please consider starring the repository on GitHub!

[![GitHub Stars](https://img.shields.io/github/stars/Waqar080206/USAR-Calendar?style=social)](https://github.com/Waqar080206/USAR-Calendar)

[⭐ Star on GitHub](https://github.com/Waqar080206/USAR-Calendar) - Your support helps us improve and maintain this project!

---

*Last Updated: multi-semester release (2026-27 session)*
