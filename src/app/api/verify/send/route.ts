import { NextResponse } from "next/server";
import {
  VERIFY_CHALLENGE_COOKIE,
  makeChallenge,
  newCode,
  normalizePhone,
  sendVerificationSms,
} from "@/lib/verify";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const raw = typeof body?.phone === "string" ? body.phone : "";
  if (raw.replace(/\D/g, "").length < 7) {
    return NextResponse.json({ ok: false, error: "bad_phone" }, { status: 400 });
  }

  const phone = normalizePhone(raw);
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
