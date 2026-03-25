import type { Metadata } from "next";

import "@/app/globals.css";

export const metadata: Metadata = {
  title: "USAR Calendar",
  description:
    "A responsive academic calendar portal for USAR students with calendar views, events, holidays, and working days calculator.",
  icons: {
    icon: "/sm.png"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
