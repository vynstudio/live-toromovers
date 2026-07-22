// Canonical Toro Movers pricing — single source of truth (2026).
// Two-tier hourly model. Everything (shrink wrap, furniture blankets,
// assembly/disassembly, equipment) is included in the rate. No fuel
// surcharge, no materials fee, no stair charge. Long-distance mileage
// applies only beyond the threshold below.
//
// Update rates HERE; prose across the site references these values.

export const PRICING = {
  laborOnly: {
    label: "Labor-only",
    baseRate: 150, // 2 movers, per hour
    baseCrew: 2,
    additionalMover: 75, // per extra mover, per hour
    minimumHours: 2,
  },
  fullService: {
    label: "Full-service",
    baseRate: 195, // 2 movers + truck (up to 26 ft), per hour
    baseCrew: 2,
    additionalMover: 100, // per extra mover, per hour
    minimumHours: 4,
    truckMaxFt: 26,
  },
  longDistance: {
    perMile: 3, // $/mile applied to distance driven...
    thresholdMiles: 100, // ...beyond this many miles
  },
  included: ["shrink wrap", "furniture blankets", "assembly and disassembly"],
} as const;

// Hourly rate for a given crew size, per tier.
export function rateFor(tier: "laborOnly" | "fullService", movers: number): number {
  const p = PRICING[tier];
  const extra = Math.max(0, movers - p.baseCrew);
  return p.baseRate + extra * p.additionalMover;
}
