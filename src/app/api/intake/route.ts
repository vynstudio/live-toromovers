import { NextResponse } from "next/server";
import { rateLimit, clientIp } from "@/lib/rate-limit";

type Endpoint = {
  address?: string;
  unit?: string;
  homeType?: string;
  bedrooms?: string;
  floor?: string;
  elevator?: string;
  stairsCount?: string;
  parkingNotes?: string;
  gateCode?: string;
  longCarry?: boolean;
  hoaNotice?: boolean;
  coiNeeded?: boolean;
  coiEmail?: string;
  accessNotes?: string;
};

type InventoryItem = { name: string; qty: number };

type IntakePayload = {
  name?: string;
  phone?: string;
  email?: string;
  moveDate?: string;
  moveTime?: string;
  timeWindow?: string;
  specificTime?: string;
  serviceType?: string;
  origin?: Endpoint;
  destination?: Endpoint;
  inventory?: {
    items?: InventoryItem[];
    totalPieces?: number;
    other?: string;
    appliances?: string[];
  };
  specialItems?: string[];
  otherSpecial?: string;
  packing?: { status?: string; needHelp?: boolean };
  services?: {
    disassembly?: boolean;
    disassemblyItems?: string;
    storage?: boolean;
    storageNotes?: string;
  };
  contacts?: {
    onSitePickupName?: string;
    onSitePickupPhone?: string;
    onSiteDropoffName?: string;
    onSiteDropoffPhone?: string;
    altPhone?: string;
    petsOnSite?: boolean | null;
    kidsOnSite?: boolean | null;
    specialInstructions?: string;
  };
};

const SERVICE_LABELS: Record<string, string> = {
  "full-service": "Full moving service (with truck)",
  "labor-only": "Labor only moving service",
  "loading-unloading": "Load / unload only",
  "packing-move": "Packing + move",
};

const PACKING_LABELS: Record<string, string> = {
  "fully-packed": "Fully packed",
  "mostly-packed": "Mostly packed",
  "partially-packed": "Partially packed",
  "not-packed": "Not packed yet",
};

const TELEGRAM_MAX = 3900;

function mapsUrl(address?: string): string | null {
  if (!address?.trim()) return null;
  return `https://maps.google.com/?q=${encodeURIComponent(address.trim())}`;
}

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

function resolveMoveTime(body: IntakePayload): string {
  return (
    body.moveTime ||
    body.specificTime ||
    (body.timeWindow && /^\d{1,2}:\d{2}$/.test(body.timeWindow) ? body.timeWindow : "") ||
    ""
  );
}

function scheduleLine(body: IntakePayload): string {
  const date = formatDate(body.moveDate);
  const time = formatTime(resolveMoveTime(body));
  if (!body.moveDate && !time) return "—";
  if (!time) return date;
  return `${date} at ${time}`;
}

function yn(v: boolean | null | undefined, yes = "Yes", no = "No"): string {
  if (v === true) return yes;
  if (v === false) return no;
  return "—";
}

function endpointBlock(title: string, e?: Endpoint): string {
  if (!e) return `${title}\n  —`;
  const br = e.bedrooms
    ? e.bedrooms === "Studio"
      ? "Studio"
      : `${e.bedrooms} BR`
    : "";
  const addr = [e.address || "(no address)", e.unit && `Unit ${e.unit}`]
    .filter(Boolean)
    .join(" · ");
  const map = mapsUrl(e.address);
  const lines = [
    title,
    `  ${addr}`,
    map ? `  🗺 ${map}` : null,
    e.homeType
      ? `  ${e.homeType}${br ? ` · ${br}` : ""}`
      : br
        ? `  ${br}`
        : null,
    e.floor ? `  Floor: ${e.floor}` : null,
    e.elevator === "yes"
      ? "  Elevator: Yes ✓"
      : e.elevator === "no"
        ? "  Elevator: No"
        : null,
    e.stairsCount ? `  Stairs: ${e.stairsCount}` : null,
    e.parkingNotes ? `  Parking: ${e.parkingNotes}` : null,
    e.gateCode ? `  Gate/code: ${e.gateCode}` : null,
    e.longCarry ? "  Long carry: Yes ⚠" : e.longCarry === false ? "  Long carry: No" : null,
    e.hoaNotice ? "  HOA notified: Yes ✓" : e.hoaNotice === false ? "  HOA notified: Not yet" : null,
    e.coiNeeded
      ? `  COI required: Yes ⚠${e.coiEmail ? ` → ${e.coiEmail}` : ""}`
      : e.coiNeeded === false
        ? "  COI required: No / not sure"
        : null,
    e.accessNotes ? `  Access notes: ${e.accessNotes}` : null,
  ].filter(Boolean) as string[];
  return lines.join("\n");
}

function inventoryLines(inv?: IntakePayload["inventory"]): string[] {
  if (!inv) return ["  —"];
  const items = inv.items?.filter((i) => i.qty > 0) || [];
  const lines: string[] = [];
  const total =
    inv.totalPieces ?? items.reduce((s, i) => s + i.qty, 0);
  if (items.length) {
    lines.push(`  Total pieces: ${total}`);
    for (const i of items) lines.push(`  ${i.qty}× ${i.name}`);
  } else {
    lines.push("  (no checklist entries)");
  }
  if (inv.appliances?.length) {
    lines.push(`  Appliances: ${inv.appliances.join(", ")}`);
  } else {
    lines.push("  Appliances: —");
  }
  if (inv.other) lines.push(`  Other: ${inv.other}`);
  return lines;
}

/** Full crew run sheet as ordered message chunks (Telegram 4096 limit). */
function buildTelegramMessages(body: IntakePayload): string[] {
  const c = body.contacts;
  const time = resolveMoveTime(body);
  const headline = [
    body.name || "Customer",
    body.moveDate || null,
    time ? formatTime(time) : null,
    body.origin?.homeType || null,
  ]
    .filter(Boolean)
    .join(" · ");

  const msg1 = [
    `📋 MOVE-DAY INTAKE — Toro Movers`,
    headline,
    `━━━━━━━━━━━━━━━━━━━━`,
    ``,
    `👤 CONTACT`,
    `  Name: ${body.name || "—"}`,
    `  Phone: ${body.phone || "—"}`,
    `  Email: ${body.email || "—"}`,
    `  Move: ${scheduleLine(body)}`,
    `  Service: ${SERVICE_LABELS[body.serviceType || ""] || body.serviceType || "—"}`,
    ``,
    endpointBlock("📍 PICKUP", body.origin),
    ``,
    endpointBlock("📍 DROP-OFF", body.destination),
  ].join("\n");

  const invLines = inventoryLines(body.inventory);
  const specials =
    body.specialItems?.length
      ? body.specialItems.join(", ")
      : "—";
  const msg2 = [
    `📦 INVENTORY`,
    ...invLines,
    ``,
    `⚠ SPECIAL / HEAVY`,
    `  ${specials}`,
    body.otherSpecial ? `  Other: ${body.otherSpecial}` : "  Other: —",
  ].join("\n");

  const msg3 = [
    `🛠 SERVICES`,
    `  Packing: ${PACKING_LABELS[body.packing?.status || ""] || body.packing?.status || "—"}`,
    `  Packing help: ${body.packing?.needHelp ? "Yes" : "No"}`,
    `  Disassembly: ${
      body.services?.disassembly
        ? `Yes${body.services.disassemblyItems ? ` (${body.services.disassemblyItems})` : ""}`
        : "No"
    }`,
    `  Storage: ${
      body.services?.storage
        ? `Yes${body.services.storageNotes ? ` · ${body.services.storageNotes}` : ""}`
        : "No"
    }`,
    ``,
    `👥 DAY-OF`,
    `  Pickup on-site: ${c?.onSitePickupName || "—"}${c?.onSitePickupPhone ? ` · ${c.onSitePickupPhone}` : ""}`,
    `  Drop-off on-site: ${c?.onSiteDropoffName || "—"}${c?.onSiteDropoffPhone ? ` · ${c.onSiteDropoffPhone}` : ""}`,
    `  Alt phone: ${c?.altPhone || "—"}`,
    `  Pets: ${yn(c?.petsOnSite)}`,
    `  Kids: ${yn(c?.kidsOnSite)}`,
    `  Notes: ${c?.specialInstructions || "—"}`,
  ].join("\n");

  // Split any oversized chunk further (long inventory).
  return [msg1, msg2, msg3].flatMap((chunk) => splitChunk(chunk, TELEGRAM_MAX));
}

function splitChunk(text: string, max: number): string[] {
  if (text.length <= max) return [text];
  const parts: string[] = [];
  let rest = text;
  while (rest.length > max) {
    let cut = rest.lastIndexOf("\n", max);
    if (cut < max * 0.5) cut = max;
    parts.push(rest.slice(0, cut));
    rest = rest.slice(cut).replace(/^\n+/, "");
  }
  if (rest) parts.push(rest);
  return parts;
}

/** Single plain-text body for email (always full, no split). */
function buildFullText(body: IntakePayload): string {
  return buildTelegramMessages(body).join("\n\n");
}

export async function POST(req: Request) {
  const rl = await rateLimit({
    key: `form:intake:${clientIp(req)}`,
    limit: 5,
    windowMs: 10 * 60 * 1000,
  });
  if (!rl.ok) {
    return NextResponse.json(
      { error: "rate_limited" },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } },
    );
  }

  const body = (await req.json().catch(() => null)) as IntakePayload | null;
  if (!body || !body.name || !body.phone || !body.email) {
    return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 400 });
  }

  const fullText = buildFullText(body);
  const telegramParts = buildTelegramMessages(body);

  const results = await Promise.allSettled([
    sendEmail(body, fullText),
    sendTelegramParts(telegramParts),
  ]);

  const emailed = results[0].status === "fulfilled" && results[0].value === true;
  const telegrammed = results[1].status === "fulfilled" && results[1].value === true;
  if (!emailed && !telegrammed) {
    console.error("[intake] NO channel delivered:", body.email, body.phone);
  }

  return NextResponse.json({
    ok: true,
    emailed,
    telegrammed,
    telegramParts: telegramParts.length,
    crmed: false,
  });
}

async function sendEmail(body: IntakePayload, text: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL || "hello@toromovers.net";
  const to =
    process.env.BOOKING_NOTIFICATION_EMAIL ||
    process.env.LEAD_NOTIFICATION_EMAIL ||
    from;
  if (!apiKey) return false;

  const schedule = scheduleLine(body);
  const html = `
  <div style="max-width:640px;margin:0 auto;padding:28px 24px;background:#ffffff;font:14px/1.55 system-ui,sans-serif;color:#0A0A0A">
    <h2 style="font:600 18px/1.3 system-ui,sans-serif;margin:0 0 4px">Move-day intake — ${escapeHtml(body.name || "")}</h2>
    <p style="margin:0 0 16px;color:#555;font-size:13px">${escapeHtml(schedule)} · ${escapeHtml(SERVICE_LABELS[body.serviceType || ""] || body.serviceType || "Service TBD")}</p>
    <pre style="white-space:pre-wrap;font:13px/1.5 ui-monospace,Menlo,monospace;color:#2A2A2A;background:#F7F7F8;padding:16px 18px;border-radius:8px;border:1px solid #E6E6EA">${escapeHtml(text)}</pre>
  </div>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `Toro Movers <${from}>`,
        to: [to],
        reply_to: body.email,
        subject: `Move-day intake — ${body.name}${body.moveDate ? ` · ${body.moveDate}` : ""}${
          resolveMoveTime(body) ? ` · ${formatTime(resolveMoveTime(body))}` : ""
        }`,
        html,
        text,
      }),
    });
    return res.ok;
  } catch (err) {
    console.error("[intake] Resend threw:", err);
    return false;
  }
}

/** Send every chunk so inventory is never truncated away. */
async function sendTelegramParts(parts: string[]): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return false;

  let anyOk = false;
  for (let i = 0; i < parts.length; i++) {
    const text =
      parts.length > 1
        ? `${parts[i]}\n\n(${i + 1}/${parts.length})`
        : parts[i];
    try {
      const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          disable_web_page_preview: true,
        }),
      });
      if (res.ok) anyOk = true;
      else {
        console.error("[intake] Telegram part failed:", i + 1, await res.text().catch(() => ""));
      }
    } catch (err) {
      console.error("[intake] Telegram threw:", err);
    }
  }
  return anyOk;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] || c),
  );
}
