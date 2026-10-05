/**
 * Single source of truth for site-wide identity and the canonical origin.
 *
 * The production domain is not committed to the repository, so it is resolved at
 * build/request time from the environment instead of being hardcoded. On Vercel
 * `VERCEL_PROJECT_PRODUCTION_URL` is set automatically for the production
 * deployment, which means correct canonicals without any extra configuration.
 * Set `NEXT_PUBLIC_SITE_URL` explicitly to pin a custom domain.
 */

const developmentOrigin = "http://localhost:3000";

/**
 * Documented fallback used when the site is built outside Vercel and no
 * `NEXT_PUBLIC_SITE_URL` is set. Override it for forks or custom domains.
 */
const defaultProductionOrigin = "https://usar-calendar.vercel.app";

function readOrigin() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (explicit) {
    return stripTrailingSlash(explicit);
  }

  // Vercel exposes both of these during builds and at request time.
  const vercelProduction = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  const vercelDeployment = process.env.VERCEL_URL?.trim();
  const candidate = vercelProduction || vercelDeployment;

  if (candidate) {
    return stripTrailingSlash(
      candidate.startsWith("http") ? candidate : `https://${candidate}`
    );
  }

  return process.env.NODE_ENV === "production"
    ? defaultProductionOrigin
    : developmentOrigin;
}

function stripTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

export const siteConfig = {
  /** Used as the Open Graph/ Twitter site name and in the manifest. */
  name: "GGSIPU Academic Calendar",
  shortName: "Academic Calendar",
  /**
   * Deliberately not "official". This is an independent student-built resource
   * that republishes dates from the university documents; it is not published by
   * Guru Gobind Singh Indraprastha University.
   */
  tagline: "Interactive GGSIPU, IPU and USAR academic calendar",
  origin: readOrigin(),
  locale: "en_IN",
  language: "en-IN",
  repository: "https://github.com/Waqar080206/USAR-Calendar",
  /** Absolute path; combine with {@link siteConfig.origin} for the full URL. */
  ogImagePath: "/opengraph-image"
} as const;

/** Builds an absolute URL from a root-relative path. */
export function absoluteUrl(path = "/") {
  return new URL(path, `${siteConfig.origin}/`).toString();
}

/**
 * Bare host with no scheme or path, for the robots.txt `Host` directive, which
 * expects `example.com` rather than a full URL.
 */
export function siteHost() {
  return new URL(siteConfig.origin).host;
}
