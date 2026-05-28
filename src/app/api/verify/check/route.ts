import { NextResponse } from "next/server";
import {
  VERIFY_CHALLENGE_COOKIE,
  VERIFY_PASS_COOKIE,
  checkChallenge,
  makePass,
  normalizePhone,
} from "@/lib/verify";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const rawPhone = typeof body?.phone === "string" ? body.phone : "";
  const code = typeof body?.code === "string" ? body.code.trim() : "";
  if (!rawPhone || !/^\d{6}$/.test(code)) {
    return NextResponse.json({ ok: false, error: "bad_input" }, { status: 400 });
  }
  const phone = normalizePhone(rawPhone);

  const challenge = req.headers
    .get("cookie")
    ?.match(new RegExp(`(?:^|;\\s*)${VERIFY_CHALLENGE_COOKIE}=([^;]+)`))?.[1];

  const outcome = checkChallenge(challenge, phone, code);
  if (outcome !== "ok") {
    return NextResponse.json({ ok: false, error: outcome }, { status: 400 });
  }

  const pass = makePass(phone);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(VERIFY_PASS_COOKIE, pass, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 1800,
  });
  // One-shot: clear the challenge once consumed.
  res.cookies.set(VERIFY_CHALLENGE_COOKIE, "", { maxAge: 0, path: "/" });
  return res;
}
