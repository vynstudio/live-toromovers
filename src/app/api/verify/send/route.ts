import { NextResponse } from "next/server";
import {
  VERIFY_CHALLENGE_COOKIE,
  makeChallenge,
  newCode,
  normalizePhone,
  sendVerificationSms,
} from "@/lib/verify";
import { rateLimit, clientIp } from "@/lib/rate-limit";

function tooMany(retryAfterSec: number) {
  return NextResponse.json(
    { ok: false, error: "rate_limited" },
    { status: 429, headers: { "Retry-After": String(retryAfterSec) } },
  );
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const raw = typeof body?.phone === "string" ? body.phone : "";
  if (raw.replace(/\D/g, "").length < 7) {
    return NextResponse.json({ ok: false, error: "bad_phone" }, { status: 400 });
  }

  const phone = normalizePhone(raw);

  // Each send costs a real SMS. Cap per-phone (stops bombing a victim's number)
  // and per-IP (stops running up the OpenPhone bill from one attacker).
  const perPhone = await rateLimit({ key: `send:phone:${phone}`, limit: 3, windowMs: 10 * 60 * 1000 });
  if (!perPhone.ok) return tooMany(perPhone.retryAfterSec);
  const perIp = await rateLimit({ key: `send:ip:${clientIp(req)}`, limit: 10, windowMs: 15 * 60 * 1000 });
  if (!perIp.ok) return tooMany(perIp.retryAfterSec);

  const code = newCode();
  const token = makeChallenge(phone, code);
  const result = await sendVerificationSms(phone, code);

  const res = NextResponse.json({
    ok: true,
    delivered: result.delivered,
    // In dev (no OpenPhone), surface the code so the form is testable. Never
    // populated when OpenPhone actually sent the SMS.
    devCode: result.devCode,
  });
  res.cookies.set(VERIFY_CHALLENGE_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
  return res;
}
