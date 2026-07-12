// Best-effort rate limiting backed by Netlify Blobs (already a dependency, so
// no external store to provision). Used to stop SMS toll-fraud / bombing on the
// OTP endpoints and code brute-forcing.
//
// Design notes:
//  - Fixed window. Not strictly atomic across concurrent invocations (a burst
//    can slip a couple extra through), which is fine for abuse prevention at
//    these thresholds — it is not a correctness-critical counter.
//  - Fails OPEN: if Blobs is unavailable we allow the request rather than break
//    the lead form. Rate limiting here is defense-in-depth, not the only gate.

import { getStore } from "@netlify/blobs";

export type RateResult = { ok: boolean; remaining: number; retryAfterSec: number };

export async function rateLimit(opts: {
  key: string;
  limit: number;
  windowMs: number;
}): Promise<RateResult> {
  const { key, limit, windowMs } = opts;
  const now = Date.now();
  try {
    const store = getStore("rate-limit");
    const prev = (await store.get(key, { type: "json" })) as
      | { count: number; reset: number }
      | null;

    let count: number;
    let reset: number;
    if (!prev || prev.reset < now) {
      count = 1;
      reset = now + windowMs;
    } else {
      count = prev.count + 1;
      reset = prev.reset;
    }
    await store.setJSON(key, { count, reset });
    return {
      ok: count <= limit,
      remaining: Math.max(0, limit - count),
      retryAfterSec: Math.max(1, Math.ceil((reset - now) / 1000)),
    };
  } catch {
    return { ok: true, remaining: limit, retryAfterSec: 0 };
  }
}

// Best-known client IP behind Netlify's proxy.
export function clientIp(req: Request): string {
  const h = req.headers;
  return (
    h.get("x-nf-client-connection-ip") ||
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}
