import type { Metadata } from "next";

import "@/app/globals.css";

export const metadata: Metadata = {
  title: "IPU Calendar Portal",
  description:
    "A responsive academic calendar portal for IPU students with calendar views, semester progress, and working days left."
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
