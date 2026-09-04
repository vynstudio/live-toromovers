import type { Metadata } from "next";
import Link from "next/link";
import { MoveChecklistWizard } from "@/components/move-checklist/wizard";
import { BUSINESS_NAME, PHONE_DISPLAY, PHONE_TEL } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Help Us Finalize Your Move",
  description:
    "Complete your Toro Movers move-day checklist after deposit so we can confirm details, prepare the crew, and send your final booking confirmation.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/move-day-checklist" },
};

export default function MoveDayChecklistPage() {
  return (
    <main className="jsf-page mdc-page">
      <header className="jsf-bar">
        <div className="jsf-bar-inner">
          <Link href="/" className="jsf-brand" aria-label={`${BUSINESS_NAME} home`}>
            Toro Movers
          </Link>
          <a href={PHONE_TEL} className="jsf-phone">
            {PHONE_DISPLAY}
          </a>
        </div>
      </header>
      <MoveChecklistWizard />
    </main>
  );
}
