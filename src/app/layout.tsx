import type { Metadata } from "next";
import { Instrument_Serif, Inter } from "next/font/google";
import "./globals.css";
import { BookingProvider } from "@/components/booking-provider";
import { BookingModal } from "@/components/booking-modal";

const serif = Instrument_Serif({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  display: "swap",
});

const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Grace & Co. — Residential care, Northeast Florida",
  description:
    "Discreet, professional residential care for the homes of Jacksonville, Ponte Vedra and St. Augustine.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://grace-co.netlify.app",
  ),
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body>
        <BookingProvider>
          {children}
          <BookingModal />
        </BookingProvider>
      </body>
    </html>
  );
}
