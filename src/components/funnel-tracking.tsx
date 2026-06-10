"use client";

import { useEffect } from "react";
import { trackFunnelView, trackCompleteRegistration } from "@/lib/track";
import { PHONE_TEL } from "@/lib/contact";

const SMS_HREF = "sms:+16896002720";

/** Fires funnel_view on landing-page mount. */
export function FunnelView({ funnel }: { funnel: string }) {
  useEffect(() => {
    trackFunnelView(funnel);
  }, [funnel]);
  return null;
}

/** Thank-you page conversion: thank_you_view (GA4) + CompleteRegistration. */
export function ThankYouView() {
  useEffect(() => {
    try {
      window.gtag?.("event", "thank_you_view");
    } catch {}
    trackCompleteRegistration();
  }, []);
  return null;
}

/** "Call Now" CTA — tel: link. phone_click is fired globally by ClickTracking. */
export function CallCta({
  className = "fn-btn fn-btn-ghost",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <a href={PHONE_TEL} className={className}>
      {children}
    </a>
  );
}

/** "Text Us" CTA — sms: link. Fires a text_click event (sms isn't covered by
 *  the global tel:/quote ClickTracking). */
export function TextCta({
  className = "fn-btn fn-btn-ghost",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const onClick = () => {
    try {
      window.gtag?.("event", "text_click");
    } catch {}
    try {
      window.fbq?.("trackCustom", "TextClick");
    } catch {}
  };
  return (
    <a href={SMS_HREF} className={className} onClick={onClick}>
      {children}
    </a>
  );
}
