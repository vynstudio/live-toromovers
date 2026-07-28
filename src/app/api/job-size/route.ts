import { NextResponse } from "next/server";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/crm/providers";

/**
 * Post-book job-size form → team email only (Resend).
 * No Telegram, no CRM stage side-effects.
 */

type Body = {
  name?: string;
  phone?: string;
  email?: string;
  moveDate?: string;
  fromAddress?: string;
  fromUnit?: string;
  toAddress?: string;
  toUnit?: string;
  size?: string;
  packed?: string;
  access?: string;
  floor?: string;
  specials?: string;
  specialsWhat?: string;
  notes?: string;
  hp?: string;
  elapsedMs?: number;
};

function crewHint(
  size: string,
  packed: string,
  access: string,
  specials: string,
): string {
  const s = size.toLowerCase();
  let base = "2 movers · ~3–4 hrs";
  if (s.includes("studio") || s.includes("few")) base = "2 movers · ~2–3 hrs";
  else if (s.includes("1")) base = "2 movers · ~3–4 hrs";
  else if (s.includes("2")) base = "2–3 movers · ~4–6 hrs";
  else if (s.includes("3")) base = "3–4 movers · ~6–8 hrs";
  else if (s.includes("4")) base = "4 movers · ~8+ hrs";

  const bumps: string[] = [];
  if (packed.toLowerCase().includes("still")) bumps.push("+packing");
  if (access.toLowerCase().includes("stair")) bumps.push("+stairs");
  if (specials.toLowerCase() === "yes") bumps.push("+specials");
  return bumps.length ? `${base} (adjust: ${bumps.join(", ")})` : base;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function row(label: string, value: string): string {
  if (!value) return "";
  return `<tr>
    <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#666;width:140px;vertical-align:top;font-size:13px">${escapeHtml(label)}</td>
    <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#0a0a0a;font-size:14px;font-weight:600">${escapeHtml(value)}</td>
  </tr>`;
}

export async function POST(req: Request) {
  const rl = await rateLimit({
    key: `job-size:${clientIp(req)}`,
    limit: 20,
    windowMs: 10 * 60 * 1000,
  });
  if (!rl.ok) {
    return NextResponse.json(
      { error: "rate_limited" },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } },
    );
  }

  const body = (await req.json().catch(() => null)) as Body | null;
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const hp = typeof body.hp === "string" ? body.hp.trim() : "";
  const elapsedMs =
    typeof body.elapsedMs === "number" ? body.elapsedMs : Infinity;
  if (hp !== "" || elapsedMs < 1200) {
    return NextResponse.json({ ok: true, spam: true });
  }

  const name = String(body.name || "").trim();
  const phone = String(body.phone || "").trim();
  const email = String(body.email || "").trim();
  const moveDate = String(body.moveDate || "").trim();
  const fromAddress = String(body.fromAddress || "").trim();
  const fromUnit = String(body.fromUnit || "").trim();
  const toAddress = String(body.toAddress || "").trim();
  const toUnit = String(body.toUnit || "").trim();
  const size = String(body.size || "").trim();
  const packed = String(body.packed || "").trim();
  const access = String(body.access || "").trim();
  const floor = String(body.floor || "").trim();
  const specials = String(body.specials || "").trim();
  const specialsWhat = String(body.specialsWhat || "").trim();
  const notes = String(body.notes || "").trim();

  if (!name || !phone) {
    return NextResponse.json(
      { error: "name_phone_required" },
      { status: 400 },
    );
  }
  if (!moveDate) {
    return NextResponse.json({ error: "move_date_required" }, { status: 400 });
  }
  if (fromAddress.length < 8 || toAddress.length < 8) {
    return NextResponse.json(
      { error: "addresses_required" },
      { status: 400 },
    );
  }
  if (!size || !packed || !access || !specials) {
    return NextResponse.json({ error: "answers_required" }, { status: 400 });
  }
  if (access === "Stairs" && !floor) {
    return NextResponse.json({ error: "floor_required" }, { status: 400 });
  }
  if (specials === "Yes" && !specialsWhat) {
    return NextResponse.json({ error: "specials_required" }, { status: 400 });
  }

  const accessLine = floor ? `${access} · floor ${floor}` : access;
  const specialsLine = specialsWhat
    ? `${specials} · ${specialsWhat}`
    : specials;
  const pickupLine = fromUnit
    ? `${fromAddress} · unit ${fromUnit}`
    : fromAddress;
  const dropoffLine = toUnit ? `${toAddress} · unit ${toUnit}` : toAddress;
  const hint = crewHint(size, packed, access, specials);

  const text = [
    "JOB SIZE — booked client",
    "",
    `Name: ${name}`,
    `Phone: ${phone}`,
    `Email: ${email || "—"}`,
    `Move date: ${moveDate}`,
    "",
    `Pickup: ${pickupLine}`,
    `Drop-off: ${dropoffLine}`,
    "",
    `Size: ${size}`,
    `Packed: ${packed}`,
    `Access: ${accessLine}`,
    `Specials: ${specialsLine}`,
    notes ? `Notes: ${notes}` : "",
    "",
    `Crew hint: ${hint}`,
  ]
    .filter((line) => line !== undefined)
    .join("\n");

  const to =
    process.env.LEAD_NOTIFICATION_EMAIL ||
    process.env.BOOKING_NOTIFICATION_EMAIL ||
    process.env.RESEND_FROM_EMAIL ||
    "hello@toromovers.net";

  const html = `
  <div style="max-width:640px;margin:0 auto;padding:24px;background:#fff;font:14px/1.5 system-ui,sans-serif;color:#0a0a0a">
    <h2 style="margin:0 0 4px;font:700 18px/1.3 system-ui,sans-serif">Job size — ${escapeHtml(name)}</h2>
    <p style="margin:0 0 16px;color:#666;font-size:13px">${escapeHtml(moveDate)} · ${escapeHtml(hint)}</p>
    <table style="width:100%;border-collapse:collapse;border:1px solid #eee;border-radius:8px">
      ${row("Name", name)}
      ${row("Phone", phone)}
      ${row("Email", email || "—")}
      ${row("Move date", moveDate)}
      ${row("Pickup", pickupLine)}
      ${row("Drop-off", dropoffLine)}
      ${row("Size", size)}
      ${row("Packed", packed)}
      ${row("Access", accessLine)}
      ${row("Specials", specialsLine)}
      ${row("Notes", notes)}
      ${row("Crew hint", hint)}
    </table>
  </div>`;

  const result = await sendEmail({
    to,
    subject: `Job size — ${name}${moveDate ? ` · ${moveDate}` : ""} · ${size}`,
    html,
    text,
    replyTo: email || undefined,
    fromName: "Toro Movers",
  });

  if (!result.ok) {
    console.error("[job-size] email failed", result.detail);
    return NextResponse.json(
      { ok: false, error: "email_failed" },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true, emailed: true });
}
