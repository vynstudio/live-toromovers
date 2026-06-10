// Client-side conversion tracking helpers. Safe no-ops if the pixel/gtag
// scripts haven't loaded (or are blocked by an ad blocker).

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
  }
}

/** Generate an event id shared between the browser pixel and server CAPI so
 *  Meta can deduplicate the two Lead events. */
export function newEventId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/** Fire a Lead conversion on the browser side (Meta Pixel + GA4). */
export function trackLead(eventId?: string): void {
  if (typeof window === "undefined") return;
  try {
    window.fbq?.("track", "Lead", {}, eventId ? { eventID: eventId } : undefined);
  } catch {
    /* pixel not loaded */
  }
  try {
    window.gtag?.("event", "generate_lead");
  } catch {
    /* gtag not loaded */
  }
}

/** User started the quote funnel — addresses captured on the ad LP / step 1.
 *  Lets Meta optimize for partial-funnel intent and lets us retarget abandoners. */
export function trackInitiateCheckout(): void {
  if (typeof window === "undefined") return;
  try {
    window.fbq?.("track", "InitiateCheckout");
  } catch {}
  try {
    window.gtag?.("event", "begin_checkout");
  } catch {}
}

/** Lead-magnet LP viewed — top of the checklist funnel. Custom event so we can
 *  build a retargeting audience of people who saw the magnet but didn't grab it. */
export function trackLeadMagnetView(): void {
  if (typeof window === "undefined") return;
  try {
    window.fbq?.("trackCustom", "LeadMagnetView");
  } catch {}
  try {
    window.gtag?.("event", "lead_magnet_view");
  } catch {}
}

/** Checklist form submitted — fires the standard Lead (deduped with CAPI via
 *  eventId) plus a granular lead_magnet_submit so this funnel is separable from
 *  the quote funnel in GA4. */
export function trackLeadMagnetSubmit(eventId?: string): void {
  if (typeof window === "undefined") return;
  try {
    window.fbq?.(
      "track",
      "Lead",
      { content_name: "moving_checklist" },
      eventId ? { eventID: eventId } : undefined,
    );
  } catch {}
  try {
    window.gtag?.("event", "lead_magnet_submit");
  } catch {}
}

/** Generic form_submit event — fires alongside lead_magnet_submit so the
 *  checklist form rolls up with any other site form conversions in GA4/Pixel. */
export function trackFormSubmit(formName: string): void {
  if (typeof window === "undefined") return;
  try {
    window.fbq?.("trackCustom", "FormSubmit", { form_name: formName });
  } catch {}
  try {
    window.gtag?.("event", "form_submit", { form_name: formName });
  } catch {}
}

/* ---- High-intent lead funnels (labor-only / full-service) ---- */

/** Funnel landing page viewed. `funnel` = "labor" | "full-service". */
export function trackFunnelView(funnel: string): void {
  if (typeof window === "undefined") return;
  try {
    window.fbq?.("trackCustom", "FunnelView", { funnel });
  } catch {}
  try {
    window.gtag?.("event", "funnel_view", { funnel });
  } catch {}
}

/** First interaction with the step form (fires once). */
export function trackFormStart(funnel: string): void {
  if (typeof window === "undefined") return;
  try {
    window.fbq?.("trackCustom", "FormStart", { funnel });
  } catch {}
  try {
    window.gtag?.("event", "form_start", { funnel });
  } catch {}
}

/** A step of the wizard was completed (1-indexed). */
export function trackFormStepComplete(funnel: string, step: number): void {
  if (typeof window === "undefined") return;
  try {
    window.fbq?.("trackCustom", "FormStepComplete", { funnel, step });
  } catch {}
  try {
    window.gtag?.("event", "form_step_complete", { funnel, step });
  } catch {}
}

/** Funnel submitted — fires the standard Lead (deduped with CAPI via eventId)
 *  plus a granular funnel_submit. Pair with trackFormSubmit for the generic
 *  form_submit rollup. */
export function trackFunnelSubmit(funnel: string, eventId?: string): void {
  if (typeof window === "undefined") return;
  try {
    window.fbq?.(
      "track",
      "Lead",
      { content_name: `${funnel}_funnel` },
      eventId ? { eventID: eventId } : undefined,
    );
  } catch {}
  try {
    window.gtag?.("event", "funnel_submit", { funnel });
  } catch {}
}

/** Visitor downloaded the PDF checklist (from the LP or the thank-you page). */
export function trackPdfDownload(): void {
  if (typeof window === "undefined") return;
  try {
    window.fbq?.("trackCustom", "PdfDownload");
  } catch {}
  try {
    window.gtag?.("event", "pdf_download", {
      file_name: "central-florida-moving-checklist.pdf",
    });
  } catch {}
}

/** Final funnel step — fires on /thank-you so Meta sees a clean conversion
 *  landing event (in addition to the Lead event fired at submit). */
export function trackCompleteRegistration(): void {
  if (typeof window === "undefined") return;
  try {
    window.fbq?.("track", "CompleteRegistration");
  } catch {}
  try {
    window.gtag?.("event", "sign_up");
  } catch {}
}

export {};
