// INTERNAL ONLY — Toro Movers rate card (2026).
// ---------------------------------------------------------------------------
// NEVER render these numbers on any public page, landing page, ad LP, form,
// success screen, email template, or SMS. Pricing is quoted by the owner on
// the call — that is how we close. This file is for ops/CRM/internal tools.
// ---------------------------------------------------------------------------
// Two-tier hourly model. Shrink wrap, furniture blankets, assembly/disassembly,
// and equipment are included. No fuel surcharge, no materials fee, no stair
// charge. Long-distance mileage applies only beyond the threshold below.

export const PRICING = {
  laborOnly: {
    label: "Labor-only",
    baseRate: 150, // 2 movers, per hour — INTERNAL
    baseCrew: 2,
    additionalMover: 65, // per extra mover, per hour — INTERNAL
    minimumHours: 2,
  },
  fullService: {
    label: "Full-service",
    baseRate: 195, // 2 movers + truck (up to 26 ft), per hour — INTERNAL
    baseCrew: 2,
    additionalMover: 65, // per extra mover, per hour — INTERNAL
    minimumHours: 4,
    truckMaxFt: 26,
  },
  longDistance: {
    perMile: 3, // $/mile applied to distance driven... INTERNAL
    thresholdMiles: 100, // ...beyond this many miles
  },
  included: ["shrink wrap", "furniture blankets", "assembly and disassembly"],
} as const;

/** Internal helper — do not use in UI. */
export function rateFor(tier: "laborOnly" | "fullService", movers: number): number {
  const p = PRICING[tier];
  const extra = Math.max(0, movers - p.baseCrew);
  return p.baseRate + extra * p.additionalMover;
}
