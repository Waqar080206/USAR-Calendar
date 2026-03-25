import type { Metadata } from "next";

import "@/app/globals.css";

export const metadata: Metadata = {
  title: "USAR Calendar",
  description:
    "A responsive academic calendar portal for USAR students with calendar views, events, holidays, and working days calculator.",
  icons: {
    icon: "https://www.citypng.com/public/uploads/preview/hd-spiderman-chibi-png-701751694950529l7f0wbvf4e.png"
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
