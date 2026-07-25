import type { Metadata, Viewport } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://toromovers.net";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default:
      "Trusted Orlando & Central Florida Movers · 4.9★ | Toro Movers",
    template: "%s | Toro Movers",
  },
};

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

/** Ultra-thin root shell. Site chrome / funnel chrome live in route-group layouts. */
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
