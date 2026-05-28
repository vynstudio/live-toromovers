// Phone-verification helpers — used by /api/verify/{send,check} and /api/booking.
// Stateless: the code (hashed) lives in a signed cookie, so it works in
// Netlify's stateless functions without a database.

import { createHmac, createHash, randomInt } from "crypto";

const SECRET =
  process.env.VERIFY_SIGNING_SECRET || "dev-only-fallback-CHANGE-ME";

const CHALLENGE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const PASS_TTL_MS = 30 * 60 * 1000; // 30 minutes — long enough to finish the form

export const VERIFY_CHALLENGE_COOKIE = "verify_challenge";
export const VERIFY_PASS_COOKIE = "verify_pass";

type Challenge = { phone: string; codeHash: string; exp: number };
type Pass = { phone: string; exp: number };

function b64url(buf: Buffer): string {
  return buf.toString("base64url");
}

function sign(payload: string): string {
  return createHmac("sha256", SECRET).update(payload).digest("hex");
}

function pack(data: object): string {
  const payload = b64url(Buffer.from(JSON.stringify(data)));
  return `${payload}.${sign(payload)}`;
}

function unpack<T>(token: string | undefined): T | null {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  if (sign(payload) !== sig) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as T & { exp?: number };
    if (data.exp && data.exp < Date.now()) return null;
    return data as T;
  } catch {
    return null;
  }
}

export function normalizePhone(raw: string): string {
  // Strip everything but digits; assume US if it's 10 digits (no country code).
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return raw.startsWith("+") ? raw : `+${digits}`;
}

export function newCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

export function makeChallenge(phone: string, code: string): string {
  const codeHash = createHash("sha256").update(code).digest("hex");
  return pack({ phone, codeHash, exp: Date.now() + CHALLENGE_TTL_MS });
}

export function checkChallenge(
  token: string | undefined,
  phone: string,
  code: string,
): "ok" | "expired" | "bad_phone" | "bad_code" {
  const data = unpack<Challenge>(token);
  if (!data) return "expired";
  if (data.phone !== phone) return "bad_phone";
  const codeHash = createHash("sha256").update(code).digest("hex");
  if (codeHash !== data.codeHash) return "bad_code";
  return "ok";
}

export function makePass(phone: string): string {
  return pack({ phone, exp: Date.now() + PASS_TTL_MS });
}

export function checkPass(token: string | undefined, phone: string): boolean {
  const data = unpack<Pass>(token);
  return !!data && data.phone === phone;
}

/** Send the verification code via OpenPhone. Falls back to a dev mode that
 *  logs to the server console + returns the code in the response — letting
 *  us test the full UX locally without OpenPhone credentials. */
export async function sendVerificationSms(
  phone: string,
  code: string,
): Promise<{ delivered: "openphone" | "dev"; devCode?: string }> {
  const apiKey = process.env.OPENPHONE_API_KEY;
  const fromId = process.env.OPENPHONE_PHONE_NUMBER_ID;

  if (!apiKey || !fromId) {
    console.log(
      `[verify/send] DEV mode (no OPENPHONE_API_KEY) — code for ${phone}: ${code}`,
    );
    return { delivered: "dev", devCode: code };
  }

  try {
    const res = await fetch("https://api.openphone.com/v1/messages", {
      method: "POST",
      headers: {
        Authorization: apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phoneNumberId: fromId,
        to: [phone],
        content: `Toro Movers: your verification code is ${code}. It expires in 10 minutes.`,
      }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("[verify/send] OpenPhone failed:", res.status, detail);
      // Fall back to dev so the form isn't a dead end while debugging.
      return { delivered: "dev", devCode: code };
    }
    return { delivered: "openphone" };
  } catch (err) {
    console.error("[verify/send] OpenPhone threw:", err);
    return { delivered: "dev", devCode: code };
  }
}

/** Send a post-submit confirmation SMS to the client via OpenPhone. */
export async function sendConfirmationSms(
  phone: string,
  firstName: string,
): Promise<boolean> {
  const apiKey = process.env.OPENPHONE_API_KEY;
  const fromId = process.env.OPENPHONE_PHONE_NUMBER_ID;
  if (!apiKey || !fromId) return false;
  try {
    const res = await fetch("https://api.openphone.com/v1/messages", {
      method: "POST",
      headers: { Authorization: apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        phoneNumberId: fromId,
        to: [phone],
        content: `Hi ${firstName}, this is Toro Movers — we got your quote request and will call you shortly. Reply STOP to opt out.`,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
