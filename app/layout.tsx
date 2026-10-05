import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";

import { themeScript } from "@/lib/theme";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "USAR Calendar",
  description:
    "A responsive academic calendar portal for USAR students with calendar views, events, holidays, and working days calculator.",
  icons: {
    icon: "/sm.png"
  }
};

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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
