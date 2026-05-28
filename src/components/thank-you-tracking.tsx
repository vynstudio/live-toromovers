"use client";

import { useEffect } from "react";
import { trackCompleteRegistration } from "@/lib/track";

// Fires the final-funnel-step conversion event once on /thank-you mount.
export function ThankYouTracking() {
  useEffect(() => {
    trackCompleteRegistration();
  }, []);
  return null;
}
