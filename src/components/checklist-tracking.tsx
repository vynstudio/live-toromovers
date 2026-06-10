"use client";

import { useEffect } from "react";
import { trackPdfDownload, trackCompleteRegistration } from "@/lib/track";

const PDF_HREF = "/central-florida-moving-checklist.pdf";

/** Branded "download the PDF" button. Fires pdf_download (GA4 + Pixel) on click.
 *  `variant` just swaps the button style class. */
export function PdfDownloadButton({
  variant = "primary",
  label = "Download the PDF checklist",
}: {
  variant?: "primary" | "outline";
  label?: string;
}) {
  return (
    <a
      href={PDF_HREF}
      target="_blank"
      rel="noopener"
      className={`btn btn-${variant}`}
      onClick={() => trackPdfDownload()}
    >
      ⬇ {label}
    </a>
  );
}

/** Thank-you page view conversion: thank_you_view (GA4) + the standard
 *  CompleteRegistration final-funnel event. Fires once on mount. */
export function ChecklistThankYouTracking() {
  useEffect(() => {
    try {
      window.gtag?.("event", "thank_you_view");
    } catch {}
    trackCompleteRegistration();
  }, []);
  return null;
}
