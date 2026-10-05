"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { getTodayKey } from "@/lib/calendar";

/**
 * `today` as a date key in the given timezone, refreshed whenever the calendar
 * day rolls over.
 *
 * The server renders the date it saw at request time, so a tab left open past
 * midnight would otherwise keep highlighting yesterday. This starts from the
 * server value (keeping SSR and the first client render identical) then resyncs
 * on mount, on a timer aimed at the next local midnight, and whenever the tab
 * becomes visible again, which covers suspended and backgrounded tabs.
 */
export function useTodayKey(timezone: string, serverTodayKey: string) {
  const [todayKey, setTodayKey] = useState(serverTodayKey);
  const timeoutRef = useRef<number | null>(null);

  const sync = useCallback(() => {
    setTodayKey(getTodayKey(timezone));
  }, [timezone]);

  /** (Re)arms a timeout that fires just after the next local midnight. */
  const armMidnightTimer = useCallback(() => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
    }

    const now = new Date();
    const nextMidnight = new Date(now);
    nextMidnight.setHours(24, 0, 0, 0);

    timeoutRef.current = window.setTimeout(() => {
      sync();
      armMidnightTimer();
    }, Math.max(nextMidnight.getTime() - now.getTime(), 1000));
  }, [sync]);

  useEffect(() => {
    // The server value can be stale if the response was cached, and a tab can
    // have been suspended across midnight.
    sync();
    armMidnightTimer();

    // A backgrounded tab gets its timers throttled, and a restored tab may have
    // missed midnight entirely, so re-check whenever it comes back into view.
    document.addEventListener("visibilitychange", sync);
    window.addEventListener("focus", sync);
    window.addEventListener("pageshow", sync);

    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      document.removeEventListener("visibilitychange", sync);
      window.removeEventListener("focus", sync);
      window.removeEventListener("pageshow", sync);
    };
  }, [armMidnightTimer, sync]);

  return todayKey;
}