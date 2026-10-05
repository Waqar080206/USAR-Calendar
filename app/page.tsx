import type { Metadata } from "next";

import { SimpleCalendar } from "@/components/simple-calendar";
import { getTodayKey } from "@/lib/calendar";
import { ipuCalendarFeed } from "@/lib/data/ipu-calendar";

export const metadata: Metadata = {
  title: "Academic Calendar · Exams, Holidays & Deadlines",
  description:
    "Official USAR academic calendar: odd and even semester classes, exams, holidays and deadlines, with shareable deep links."
};

type HomePageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default function HomePage({ searchParams }: HomePageProps) {
  return (
    <SimpleCalendar
      feed={ipuCalendarFeed}
      serverTodayKey={getTodayKey(ipuCalendarFeed.semesters[0].timezone)}
      initialQuery={searchParams ?? {}}
    />
  );
}
