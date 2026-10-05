import type { Metadata } from "next";

import { absoluteUrl, siteConfig } from "@/lib/site";

type PageMetadataInput = {
  title: string;
  description: string;
  /** Root-relative path, e.g. "/usar-holiday-list". */
  path: string;
  /** Absolute OG image URL; defaults to the generated share image. */
  ogImage?: string;
};

/**
 * Builds a consistent metadata object for every route so titles, canonicals and
 * social cards can never drift apart. `metadataBase` lives in the root layout;
 * paths here are relative to it.
 */
export function buildPageMetadata({
  title,
  description,
  path,
  ogImage
}: PageMetadataInput): Metadata {
  const canonical = path === "/" ? "/" : path;
  const image = ogImage ?? absoluteUrl(siteConfig.ogImagePath);

  return {
    // `absolute` opts out of the root template, because these titles already
    // carry the site name as part of the search intent.
    title: { absolute: title },
    description,
    alternates: {
      canonical
    },
    openGraph: {
      type: "website",
      locale: siteConfig.locale,
      url: canonical,
      siteName: siteConfig.name,
      title,
      description,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: `${siteConfig.name} 2026-27`
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image]
    }
  };
}

/** Root metadata: identity, defaults and crawl directives for the whole site. */
export function buildRootMetadata(): Metadata {
  return {
    metadataBase: new URL(siteConfig.origin),
    title: {
      default: "GGSIPU Academic Calendar 2026-27 | IPU Calendar",
      template: `%s | ${siteConfig.name}`
    },
    description:
      "Interactive GGSIPU academic calendar 2026-27 with semester dates, examinations, holidays and important academic events for IPU and USAR students.",
    applicationName: siteConfig.name,
    authors: [{ name: "USAR Calendar", url: siteConfig.repository }],
    creator: "USAR Calendar",
    publisher: "USAR Calendar",
    // No canonical here on purpose: every page declares its own, and a canonical
    // inherited from the root would silently point a page at "/" if one forgot.
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1
      }
    },
    openGraph: {
      type: "website",
      locale: siteConfig.locale,
      siteName: siteConfig.name,
      title: "GGSIPU Academic Calendar 2026-27 | IPU Calendar",
      description:
        "Interactive GGSIPU academic calendar 2026-27 with semester dates, examinations, holidays and important academic events for IPU and USAR students.",
      images: [
        {
          url: absoluteUrl(siteConfig.ogImagePath),
          width: 1200,
          height: 630,
          alt: "GGSIPU Academic Calendar 2026-27 for IPU and USAR students"
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: "GGSIPU Academic Calendar 2026-27 | IPU Calendar",
      description:
        "Interactive GGSIPU academic calendar 2026-27 with semester dates, examinations, holidays and important academic events for IPU and USAR students.",
      images: [absoluteUrl(siteConfig.ogImagePath)]
    },
    formatDetection: {
      telephone: false
    },
    icons: {
      icon: [{ url: "/sm.png", type: "image/png", sizes: "800x800" }],
      apple: [{ url: "/sm.png", sizes: "800x800" }]
    },
    manifest: "/manifest.webmanifest"
  };
}
