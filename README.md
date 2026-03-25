# USAR Calendar Portal

A clean, simple one-page calendar application for visualizing academic events, exams, holidays, and deadlines. Built with **Next.js 14**, **React 18**, and **TypeScript**, styled with **Tailwind CSS**.

**Current Semester:** USAR Even Semester 2026 (Jan 16 - Jul 31, 2026)

## Features

- 📅 **Month Grid Calendar** - View full month at a glance (like Google Calendar)
- 🎨 **Color-Coded Events** - Different colors for exam, holiday, deadline, class, registration, break, and notice events
- 📋 **Event Details** - Click any date to see full event descriptions below the calendar
- 🔄 **Easy Navigation** - Previous/Next month buttons and quick "Today" button
- 📱 **Responsive Design** - Works perfectly on desktop and mobile devices
- ⚡ **Fast & Lightweight** - No external dependencies for calendar logic, minimal bundle size
- 🎯 **Hardcoded Data** - Events embedded directly in code for instant loading

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
│   ├── page.tsx           # Main page entry point
│   ├── layout.tsx         # Root layout with global styles
│   └── globals.css        # Global styles
├── components/
│   ├── simple-calendar.tsx # Main calendar component
│   └── stat-chip.tsx       # Statistics badge component
├── lib/
│   ├── calendar.ts         # Calendar utilities & functions
│   ├── types.ts            # TypeScript type definitions
│   ├── utils.ts            # Helper utilities
│   └── data/
│       └── ipu-calendar.ts # Hardcoded event data
├── public/                 # Static assets
├── package.json            # Project dependencies
├── tsconfig.json           # TypeScript configuration
└── tailwind.config.ts      # Tailwind CSS configuration
```

## How It Works

### Calendar Display

The calendar shows:
- **Full month grid** with 6 weeks (like Google Calendar)
- **Dates from adjacent months** in lighter gray
- **Today highlighted** in blue
- **Selected date** with blue ring border
- **Event badges** on each date (up to 2, with "+X more" indicator)

### Event Types & Colors

| Type | Color | Use Case |
|------|-------|----------|
| **Exam** | 🔴 Red | Exams & assessments |
| **Holiday** | 🟡 Yellow | National/local holidays |
| **Deadline** | 🟠 Orange | Assignment/project deadlines |
| **Class** | 🔵 Blue | Regular classes & lectures |
| **Registration** | 🟢 Green | Course/exam registration periods |
| **Break** | 🟣 Purple | Holiday/semester breaks |
| **Notice** | ⚪ Gray | General notices & announcements |

### Event Data Structure

Events are defined in `lib/data/ipu-calendar.ts`:

```typescript
{
  id: "classes-begin",
  title: "Regular Classes Begin",
  type: "class",
  startDate: "2026-01-15",
  endDate: "2026-01-15",
  allDay: true,
  description: "Teaching schedule becomes active across all institutes.",
  source: "Academic Calendar PDF"
}
```

**Date Format:** `YYYY-MM-DD` (ISO 8601)

**Event Types:** `"exam" | "holiday" | "deadline" | "class" | "registration" | "break" | "notice"`

## Adding Events

### Method 1: Direct Code Entry (Current)

Edit `lib/data/ipu-calendar.ts` and add events to the `events` array:

```typescript
export const ipuCalendarFeed: CalendarFeed = {
  semester: {
    name: "IPU Even Semester 2026",
    startDate: "2026-01-12",
    endDate: "2026-06-15",
    workingWeekdays: [1, 2, 3, 4, 5, 6], // Mon-Sat
    timezone: "Asia/Kolkata"
  },
  events: [
    {
      id: "event-1",
      title: "Event Title",
      type: "class",
      startDate: "2026-03-15",
      endDate: "2026-03-15",
      allDay: true,
      description: "Event description",
      source: "Calendar PDF"
    }
    // Add more events here
  ],
  holidays: [ /* ... */ ],
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
| `npm test` | Run unit tests |

## Technology Stack

- **Framework:** Next.js 14.2
- **Runtime:** Node.js 18+
- **Language:** TypeScript 5.7
- **UI Styling:** Tailwind CSS 3.4
- **Date Handling:** date-fns 3.6
- **Build Tool:** Webpack (via Next.js)

## Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Customization

### Change Semester Details

Edit `lib/data/ipu-calendar.ts`:

```typescript
semester: {
  name: "USAR Even Semester 2026",
  startDate: "2026-01-16",
  endDate: "2026-07-31",
  workingWeekdays: [1, 2, 3, 4, 5], // 0=Sun, 1=Mon, ..., 6=Sat (Mon-Fri = 5 days/week)
  timezone: "Asia/Kolkata"
}
```

### Change Colors

Edit `lib/calendar.ts` and modify `eventTypeMeta`:

```typescript
exam: {
  label: "Exam",
  chipClass: "bg-rose-100 text-rose-800",      // Light background
  surfaceClass: "bg-rose-50/80 text-rose-900", // Subtle hover
  dotClass: "bg-rose-500"                       // Calendar badge
}
```

### Modify Calendar Styling

Global styles: `app/globals.css`  
Component styles: `components/simple-calendar.tsx`  
Tailwind config: `tailwind.config.ts`

## Performance

- **Load Time:** ~100ms (with cached dependencies)
- **Bundle Size:** ~150KB (gzipped)
- **Interactive:** <200ms time to interactive
- **No external APIs:** Instant rendering, works offline

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

- [ ] PDF upload & parsing
- [ ] Event CRUD operations (add/edit/delete)
- [ ] Multiple semester support
- [ ] Filter by event type
- [ ] Dark mode
- [ ] Export to Google Calendar / iCal
- [ ] Email notifications for upcoming events
- [ ] Mobile app (React Native)

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

## Current Calendar Events (USAR Even Semester 2026)

### Key Dates

- **Classes:** Jan 16 - May 21, 2026 (5-day week)
- **Mid Term I:** Mar 2-14, 2026
- **Mid Term II:** Apr 20-25, 2026
- **Practical Exams:** May 1-21, 2026
- **Theory Exams:** May 22 - Jun 13, 2026
- **Internship (4th & 6th sem):** Jun 15 - Jul 31, 2026

### Notable Events

- 🎭 **Anugoonj 2026** - Cultural Festival (Feb 4-6)
- 🤖 **Prompt Craft: GenAI Summit 2026** (Apr 6)
- 👋 **Afsana 2.0 Farewell** (Apr 29)
- 📚 **Faculty Development Program** (Apr 20-25)

---

**Built for USAR Students** 🎓  
*Making academic calendars simple, visual, and accessible.*

---

## Support This Project

If you find this calendar useful, please consider starring the repository on GitHub!

[![GitHub Stars](https://img.shields.io/github/stars/Waqar080206/USAR-Calendar?style=social)](https://github.com/Waqar080206/USAR-Calendar)

[⭐ Star on GitHub](https://github.com/Waqar080206/USAR-Calendar) - Your support helps us improve and maintain this project!

---

*Last Updated: March 2026*
