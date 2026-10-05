import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";

import { themeScript } from "@/lib/theme";
import { buildRootMetadata } from "@/lib/metadata";
import { webSiteSchema } from "@/lib/structured-data";
import { JsonLd } from "@/components/json-ld";
import "@/app/globals.css";

export const metadata: Metadata = buildRootMetadata();

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f3ee" },
    { media: "(prefers-color-scheme: dark)", color: "#080c0b" }
  ]
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-IN" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {/* Site-level entity, inherited by every page on the site. */}
        <JsonLd data={webSiteSchema()} />
      </head>
      <body className="antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
