import type { MetadataRoute } from "next";

import { absoluteUrl, siteHost } from "@/lib/site";

/**
 * Crawling is fully open. Every route that renders content is meant to be
 * indexed, including the landing pages and the sitemap itself. Query-string
 * variants of the calendar collapse onto a single canonical URL through the
 * per-page `alternates.canonical`, so they do not need a robots exclusion.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/"
      }
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: siteHost()
  };
}
