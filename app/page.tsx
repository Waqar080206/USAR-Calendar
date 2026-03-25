import { SimpleCalendar } from "@/components/simple-calendar";
import { getTodayKey } from "@/lib/calendar";
import { ipuCalendarFeed } from "@/lib/data/ipu-calendar";

export default function HomePage() {
  return (
    <SimpleCalendar
      feed={ipuCalendarFeed}
      todayKey={getTodayKey(ipuCalendarFeed.semester.timezone)}
    />
  );
}
