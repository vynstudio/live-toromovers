import { NextResponse } from "next/server";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { sendEmail, sendTelegram } from "@/lib/crm/providers";

/**
 * Post-book /your-move form → team email (Resend) + one Telegram message.
 */

type Inventory = Record<string, number>;

type Body = {
  name?: string;
  phone?: string;
  email?: string;
  moveDate?: string;
  moveTime?: string;
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
  inventory?: Inventory;
  inventoryNotes?: string;
  notes?: string;
  hp?: string;
  elapsedMs?: number;
};

const INV_LABELS: Record<string, string> = {
  boxes: "Boxes",
  beds: "Beds (frames)",
  mattresses: "Mattresses",
  sofas: "Sofas / couches",
  tvs: "TVs",
  dressers: "Dressers / chests",
  diningTables: "Dining tables",
  chairs: "Chairs",
  appliances: "Appliances",
  otherFurniture: "Other furniture",
};

function formatTime(time?: string): string {
  if (!time) return "";
  const m = time.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return time;
  let h = Number(m[1]);
  const min = m[2];
  if (Number.isNaN(h)) return time;
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${min} ${ampm}`;
}

function formatDate(date?: string): string {
  if (!date) return "—";
  const parts = date.split("-").map(Number);
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return date;
  const [y, mo, d] = parts;
  return new Date(y, mo - 1, d).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

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
    <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#666;width:150px;vertical-align:top;font-size:13px">${escapeHtml(label)}</td>
    <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#0a0a0a;font-size:14px;font-weight:600;white-space:pre-wrap">${escapeHtml(value)}</td>
  </tr>`;
}

function formatInventory(inv: Inventory | undefined, notes: string): string {
  const lines: string[] = [];
  if (inv && typeof inv === "object") {
    for (const [key, raw] of Object.entries(inv)) {
      const n = Number(raw);
      if (!Number.isFinite(n) || n <= 0) continue;
      const label = INV_LABELS[key] || key;
      lines.push(`${label}: ${n}`);
    }
  }
  if (notes) lines.push(`Other: ${notes}`);
  return lines.join("\n");
}

function inventoryCount(inv: Inventory | undefined): number {
  if (!inv || typeof inv !== "object") return 0;
  return Object.values(inv).reduce((sum, raw) => {
    const n = Number(raw);
    return sum + (Number.isFinite(n) && n > 0 ? n : 0);
  }, 0);
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
  // Soft spam gate — do NOT pretend success (client needs a clear retry).
  if (hp !== "" || elapsedMs < 800) {
    return NextResponse.json({ ok: false, spam: true, error: "spam" }, { status: 400 });
  }

  const name = String(body.name || "").trim();
  const phone = String(body.phone || "").trim();
  const email = String(body.email || "").trim();
  const moveDate = String(body.moveDate || "").trim();
  const moveTime = String(body.moveTime || "").trim();
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
  const inventoryNotes = String(body.inventoryNotes || "").trim();
  const notes = String(body.notes || "").trim();
  const inventory = body.inventory;

  if (!name || !phone) {
    return NextResponse.json(
      { error: "name_phone_required" },
      { status: 400 },
    );
  }
  if (!moveDate) {
    return NextResponse.json({ error: "move_date_required" }, { status: 400 });
  }
  if (!moveTime) {
    return NextResponse.json({ error: "move_time_required" }, { status: 400 });
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
  if (inventoryCount(inventory) === 0 && !inventoryNotes) {
    return NextResponse.json({ error: "inventory_required" }, { status: 400 });
  }

  const accessLine = floor ? `${access} · floor ${floor}` : access;
  const specialsLine = specialsWhat
    ? `${specials} · ${specialsWhat}`
    : specials;
  const pickupLine = fromUnit
    ? `${fromAddress} · unit ${fromUnit}`
    : fromAddress;
  const dropoffLine = toUnit ? `${toAddress} · unit ${toUnit}` : toAddress;
  const dateLabel = formatDate(moveDate);
  const timeLabel = formatTime(moveTime);
  const schedule = `${dateLabel} · ${timeLabel}`;
  const invText = formatInventory(inventory, inventoryNotes);
  const hint = crewHint(size, packed, access, specials);

  const text = [
    "📦 YOUR MOVE — booked client",
    "",
    `Name: ${name}`,
    `Phone: ${phone}`,
    `Email: ${email || "—"}`,
    `When: ${schedule}`,
    "",
    `Pickup: ${pickupLine}`,
    `Drop-off: ${dropoffLine}`,
    "",
    `Size: ${size}`,
    `Packed: ${packed}`,
    `Access: ${accessLine}`,
    `Specials: ${specialsLine}`,
    "",
    "Inventory:",
    invText || "—",
    notes ? `\nNotes: ${notes}` : "",
    "",
    `→ Crew: ${hint}`,
  ]
    .filter((line) => line !== undefined)
    .join("\n");

  // Telegram hard limit 4096 — keep a margin
  const TELEGRAM_MAX = 4000;
  const telegramText =
    text.length <= TELEGRAM_MAX
      ? text
      : `${text.slice(0, TELEGRAM_MAX - 1)}…`;

  const to =
    process.env.LEAD_NOTIFICATION_EMAIL ||
    process.env.BOOKING_NOTIFICATION_EMAIL ||
    process.env.RESEND_FROM_EMAIL ||
    "hello@toromovers.net";

  const html = `
  <div style="max-width:640px;margin:0 auto;padding:24px;background:#fff;font:14px/1.5 system-ui,sans-serif;color:#0a0a0a">
    <h2 style="margin:0 0 4px;font:700 18px/1.3 system-ui,sans-serif">Your move — ${escapeHtml(name)}</h2>
    <p style="margin:0 0 16px;color:#666;font-size:13px">${escapeHtml(schedule)} · ${escapeHtml(hint)}</p>
    <table style="width:100%;border-collapse:collapse;border:1px solid #eee;border-radius:8px">
      ${row("Name", name)}
      ${row("Phone", phone)}
      ${row("Email", email || "—")}
      ${row("Date", dateLabel)}
      ${row("Start time", timeLabel)}
      ${row("Pickup", pickupLine)}
      ${row("Drop-off", dropoffLine)}
      ${row("Size", size)}
      ${row("Packed", packed)}
      ${row("Access", accessLine)}
      ${row("Specials", specialsLine)}
      ${row("Inventory", invText)}
      ${row("Notes", notes)}
      ${row("Crew hint", hint)}
    </table>
  </div>`;

  const [emailResult, telegramResult] = await Promise.all([
    sendEmail({
      to,
      subject: `Your move — ${name} · ${dateLabel} ${timeLabel} · ${size}`,
      html,
      text,
      replyTo: email || undefined,
      fromName: "Toro Movers",
    }),
    sendTelegram(telegramText),
  ]);

  const emailed = emailResult.ok;
  const telegrammed = telegramResult.ok;

  if (!emailed && !telegrammed) {
    console.error(
      "[job-size] no channel delivered",
      "email=",
      emailResult.detail,
      "telegram=",
      telegramResult.detail,
    );
    return NextResponse.json(
      {
        ok: false,
        error: "delivery_failed",
        detail: {
          email: emailResult.detail,
          telegram: telegramResult.detail,
        },
      },
      { status: 502 },
    );
  }

  if (!emailed) {
    console.error("[job-size] email failed", emailResult.detail, "to=", to);
  }
  if (!telegrammed) {
    console.error("[job-size] telegram failed", telegramResult.detail);
  }

  return NextResponse.json({
    ok: true,
    emailed,
    telegrammed,
  });
}
