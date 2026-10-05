import Link from "next/link";

import { SiteFooter, SiteNav } from "@/components/seo/site-chrome";

/**
 * Shared chrome for the static landing pages: nav, a single H1, a server-rendered
 * body and the site footer. Every page using this renders its own unique content
 * below; nothing here is keyword-metadata that could duplicate another page.
 */
export function SeoPageShell({
  currentPath,
  eyebrow,
  heading,
  intro,
  children
}: {
  currentPath: string;
  eyebrow: string;
  heading: string;
  intro: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteNav currentPath={currentPath} />

      <main className="mx-auto max-w-5xl px-4 pt-10 pb-6 sm:px-6 lg:px-8">
        <article>
          <p className="text-[10px] font-bold tracking-[0.2em] text-brand uppercase">
            {eyebrow}
          </p>

          <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-balance text-ink sm:text-4xl">
            {heading}
          </h1>

          <div className="mt-4 flex max-w-3xl flex-col gap-3 text-sm leading-relaxed text-ink-muted sm:text-[15px]">
            {intro}
          </div>

          {children}
        </article>
      </main>

      <SiteFooter />
    </>
  );
}

/** Cross-links to the sibling pages, always including the calendar itself. */
export function PageLinks({
  heading = "Related pages",
  links
}: {
  heading?: string;
  links: Array<{ href: string; title: string; description: string }>;
}) {
  return (
    <section className="mt-12">
      <h2 className="text-xl font-semibold tracking-tight text-ink">{heading}</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="panel group flex flex-col gap-1 rounded-2xl px-4 py-4 transition-colors hover:bg-elevated"
          >
            <span className="text-sm font-semibold text-ink group-hover:text-brand">
              {link.title}
            </span>
            <span className="text-xs leading-relaxed text-ink-subtle">
              {link.description}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
