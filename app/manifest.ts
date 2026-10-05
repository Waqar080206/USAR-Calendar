import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "GGSIPU Academic Calendar 2026-27",
    short_name: "Academic Calendar",
    description:
      "Interactive GGSIPU academic calendar 2026-27 with semester dates, examinations, holidays and academic events for IPU and USAR students.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f5f3ee",
    theme_color: "#0b7a5a",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/sm.png",
        sizes: "800x800",
        type: "image/png",
        purpose: "any"
      }
    ]
  };
}
