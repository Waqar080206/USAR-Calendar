import Link from "next/link";

import { seoRoutes } from "@/lib/seo-routes";
import { siteConfig } from "@/lib/site";

/**
 * Crawlable primary navigation. These are real anchors in server-rendered HTML,
 * so every landing page is reachable by a crawler without executing JavaScript.
 */
export function SiteNav({ currentPath }: { currentPath: string }) {
  return (
    <nav
      aria-label="Primary"
      className="border-b border-line/50 bg-canvas/80 backdrop-blur-sm"
    >
      <div className="mx-auto flex max-w-[1680px] flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="text-sm font-semibold tracking-tight text-ink transition-colors hover:text-brand"
        >
          {siteConfig.shortName}
        </Link>

        <ul className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs font-medium text-ink-muted">
          {seoRoutes
            .filter((route) => route.path !== "/")
            .map((route) => {
              const isCurrent = route.path === currentPath;

              return (
                <li key={route.path}>
                  <Link
                    href={route.path}
                    aria-current={isCurrent ? "page" : undefined}
                    className={
                      isCurrent
                        ? "text-brand"
                        : "transition-colors hover:text-brand"
                    }
                  >
                    {route.label}
                  </Link>
                </li>
              );
            })}
        </ul>
      </div>
    </nav>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-10 border-t border-line/50 bg-canvas/80">
      <div className="mx-auto flex max-w-[1680px] flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-xl">
            <p className="text-sm font-semibold text-ink">{siteConfig.name}</p>
            <p className="mt-1 text-xs leading-relaxed text-ink-subtle">
              An independent, student-built reference for GGSIPU, IPU and USAR
              academic dates. Not published by Guru Gobind Singh Indraprastha
              University. Always confirm a date against the official university
              notification before relying on it.
            </p>
          </div>

          <nav aria-label="Footer" className="shrink-0">
            <h2 className="text-[10px] font-bold tracking-[0.16em] text-ink-subtle uppercase">
              Pages
            </h2>
            <ul className="mt-3 flex flex-col gap-2 text-xs font-medium text-ink-muted">
              {seoRoutes.map((route) => (
                <li key={route.path}>
                  <Link
                    href={route.path}
                    className="transition-colors hover:text-brand"
                  >
                    {route.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <p className="border-t border-line/50 pt-5 text-[11px] text-ink-subtle">
          Source: USAR Academic Calendar and IPU holiday notifications.{" "}
          <a
            href={siteConfig.repository}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-brand transition-colors hover:text-brand/75"
          >
            View source on GitHub
          </a>
        </p>
      </div>
    </footer>
  );
}
