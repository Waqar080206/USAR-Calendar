import { CalendarPortal } from "@/components/calendar-portal";
import { getTodayKey } from "@/lib/calendar";
import { ipuCalendarFeed } from "@/lib/data/ipu-calendar";

export default function HomePage({
  searchParams
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  return (
    <CalendarPortal
      feed={ipuCalendarFeed}
      initialQuery={searchParams ?? {}}
      todayKey={getTodayKey(ipuCalendarFeed.semester.timezone)}
    />
  );
}
