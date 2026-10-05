import type { MetadataRoute } from "next";

import { seoRoutes } from "@/lib/seo-routes";

/**
 * Resolved once per build rather than per request. The calendar data is
 * version-controlled, so a fresh timestamp on every request would tell crawlers
 * every page had just changed and cause needless re-crawling.
 */
const buildTimestamp = new Date();

/**
 * The sitemap lists only real, indexable pages. Query-string variants of the
 * calendar (`?sem=`, `?month=`, `?date=`, `?view=`, `?event=`) are deliberately
 * excluded: they are deep-link states of a single page, not separate documents,
 * and every one of them canonicalises back to "/".
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return seoRoutes.map((route) => ({
    url: route.url,
    lastModified: buildTimestamp,
    changeFrequency: route.changeFrequency,
    priority: route.priority
  }));
}
