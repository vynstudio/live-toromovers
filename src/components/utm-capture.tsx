"use client";

import { useEffect } from "react";
import { captureAttribution } from "@/lib/utm";

// Mounted once in the root layout — records marketing attribution on landing.
export function UtmCapture() {
  useEffect(() => {
    captureAttribution();
  }, []);
  return null;
}
