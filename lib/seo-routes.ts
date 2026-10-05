import { siteConfig } from "@/lib/site";

export interface SeoRoute {
  /** Clean, indexable path. Never a query string. */
  path: string;
  /** Absolute URL built from the resolved site origin. */
  url: string;
  /** Used for the sitemap and for cross-linking between pages. */
  label: string;
  changeFrequency: "daily" | "weekly" | "monthly";
  priority: number;
}

function build(path: string, label: string, changeFrequency: SeoRoute["changeFrequency"], priority: number): SeoRoute {
  return {
    path,
    url: `${siteConfig.origin}${path}`,
    label,
    changeFrequency,
    priority
  };
}

/**
 * The complete set of indexable pages. Every entry here must have a matching
 * route in `app/`, and every route in `app/` must appear in this list.
 */
export const seoRoutes: SeoRoute[] = [
  build("/", "GGSIPU Academic Calendar 2026-27", "weekly", 1),
  build("/ggsipu-academic-calendar", "GGSIPU Academic Calendar", "weekly", 0.9),
  build("/ipu-academic-calendar", "IPU Academic Calendar", "weekly", 0.85),
  build("/usar-academic-calendar", "USAR Academic Calendar", "weekly", 0.8),
  build("/usar-holiday-list", "USAR Holiday List", "monthly", 0.75)
];

export const homeRoute = seoRoutes[0];

/**
 * Throws on an unknown path instead of falling back to the home route. A silent
 * fallback would canonicalise the wrong page to "/" without any build error.
 */
export function getRoute(path: string): SeoRoute {
  const route = seoRoutes.find((candidate) => candidate.path === path);

  if (!route) {
    throw new Error(
      `Unknown SEO route "${path}". Add it to seoRoutes so the sitemap and internal links stay in sync.`
    );
  }

  return route;
}
