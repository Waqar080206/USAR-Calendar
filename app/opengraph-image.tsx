import { ImageResponse } from "next/og";

import { ipuCalendarFeed } from "@/lib/data/ipu-calendar";

export const runtime = "edge";
export const alt =
  "GGSIPU Academic Calendar 2026-27 — semester dates, exams and holidays for IPU and USAR students";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Social share card, generated on demand so the copy stays in step with the
 * calendar data instead of drifting in a checked-in binary.
 */
export default function OpengraphImage() {
  const semesterCount = ipuCalendarFeed.semesters.length;
  const eventCount = ipuCalendarFeed.events.length;
  const holidayCount = ipuCalendarFeed.holidays.length;

  const stats = [
    { value: String(semesterCount), label: "Semesters" },
    { value: String(eventCount), label: "Academic events" },
    { value: String(holidayCount), label: "Holidays" }
  ];

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#f5f3ee",
          backgroundImage:
            "linear-gradient(135deg, #0b7a5a 0%, #0f9d76 55%, #d97706 100%)",
          padding: "72px",
          color: "#ffffff",
          fontFamily: "sans-serif"
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              padding: "10px 22px",
              borderRadius: "999px",
              backgroundColor: "rgba(255,255,255,0.18)",
              border: "1px solid rgba(255,255,255,0.35)",
              fontSize: 24,
              letterSpacing: 4,
              textTransform: "uppercase"
            }}
          >
            GGSIPU • IPU • USAR
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: 36
            }}
          >
            <div style={{ fontSize: 78, fontWeight: 700, lineHeight: 1.05 }}>
              Academic Calendar
            </div>
            <div style={{ fontSize: 78, fontWeight: 700, lineHeight: 1.05 }}>
              2026–27
            </div>
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 28,
              fontSize: 32,
              opacity: 0.94
            }}
          >
            Academic Dates • Exams • Holidays
          </div>
        </div>

        <div style={{ display: "flex", gap: 20 }}>
          {stats.map((stat) => (
            <div
              key={stat.label}
              style={{
                display: "flex",
                flexDirection: "column",
                padding: "18px 30px",
                borderRadius: 20,
                backgroundColor: "rgba(255,255,255,0.16)",
                border: "1px solid rgba(255,255,255,0.28)"
              }}
            >
              <div style={{ fontSize: 40, fontWeight: 700 }}>{stat.value}</div>
              <div style={{ fontSize: 22, opacity: 0.9 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    ),
    size
  );
}
