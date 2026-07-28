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
  /** @deprecated kept for older clients; prefer moveTime */
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
  "full-service": "Full-service move",
  "labor-only": "Labor only",
  "loading-unloading": "Load / unload only",
  "packing-move": "Packing + move",
};

const PACKING_LABELS: Record<string, string> = {
  "fully-packed": "Fully packed",
  "mostly-packed": "Mostly packed",
  "partially-packed": "Partially packed",
  "not-packed": "Not packed yet",
};

function endpointSummary(e?: Endpoint, label = ""): string {
  if (!e) return "—";
  const br = e.bedrooms ? (e.bedrooms === "Studio" ? "Studio" : `${e.bedrooms} BR`) : "";
  const addr = [e.address || "(no address)", e.unit && `Unit ${e.unit}`].filter(Boolean).join(", ");
  const parts = [
    label && `${label}`,
    addr,
    e.homeType && (br ? `${e.homeType}, ${br}` : e.homeType),
    e.floor,
    e.elevator === "yes" ? "Elevator ✓" : e.elevator === "no" ? "No elevator" : null,
    e.stairsCount && `${e.stairsCount} stairs`,
    e.parkingNotes && `Parking: ${e.parkingNotes}`,
    e.gateCode && `Gate/code: ${e.gateCode}`,
    e.longCarry ? "Long carry ⚠" : null,
    e.hoaNotice ? "HOA notified ✓" : null,
    e.coiNeeded ? `COI required ⚠${e.coiEmail ? ` → ${e.coiEmail}` : ""}` : null,
    e.accessNotes && `Access: ${e.accessNotes}`,
  ].filter(Boolean);
  return parts.join("\n  ");
}

function inventorySummary(inv?: IntakePayload["inventory"]): string {
  if (!inv) return "—";
  const items = inv.items?.filter((i) => i.qty > 0) || [];
  const lines: string[] = [];
  if (items.length) {
    lines.push(`Total pieces: ${inv.totalPieces ?? items.reduce((s, i) => s + i.qty, 0)}`);
    for (const i of items) {
      lines.push(`  ${i.qty}× ${i.name}`);
    }
  } else {
    lines.push("No item checklist entries");
  }
  if (inv.appliances?.length) {
    lines.push(`Appliances: ${inv.appliances.join(", ")}`);
  }
  if (inv.other) {
    lines.push(`Other: ${inv.other}`);
  }
  return lines.join("\n");
}

/** Format HH:MM (24h) as 8:00 AM style. */
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

/** Human date from YYYY-MM-DD without timezone shift. */
function formatDate(date?: string): string {
  if (!date) return "—";
  const parts = date.split("-").map(Number);
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return date;
  const [y, mo, d] = parts;
  const dt = new Date(y, mo - 1, d);
  return dt.toLocaleDateString("en-US", {
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

export async function POST(req: Request) {
  // Rate-limit public form submits per IP to blunt bot spam (best-effort, fails open).
  const rl = await rateLimit({ key: `form:intake:${clientIp(req)}`, limit: 5, windowMs: 10 * 60 * 1000 });
  if (!rl.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } });
  }
  const body = (await req.json().catch(() => null)) as IntakePayload | null;
  if (!body || !body.name || !body.phone || !body.email) {
    return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 400 });
  }

  const c = body.contacts;
  const lines: string[] = [
    `📋 Move-day intake — Toro Movers`,
    ``,
    `Name: ${body.name}`,
    `Phone: ${body.phone}`,
    `Email: ${body.email}`,
    `Move: ${scheduleLine(body)}`,
    `Service: ${SERVICE_LABELS[body.serviceType || ""] || body.serviceType || "—"}`,
    ``,
    `PICKUP:`,
    `  ${endpointSummary(body.origin)}`,
    ``,
    `DROP-OFF:`,
    `  ${endpointSummary(body.destination)}`,
    ``,
    `ITEM CHECKLIST:`,
    inventorySummary(body.inventory),
    ``,
    `Special items: ${
      body.specialItems?.length ? body.specialItems.join(", ") : "—"
    }${body.otherSpecial ? ` · other: ${body.otherSpecial}` : ""}`,
    ``,
    `Packing: ${PACKING_LABELS[body.packing?.status || ""] || body.packing?.status || "—"}${
      body.packing?.needHelp ? " · Needs packing help" : ""
    }`,
    ``,
    `Services:`,
    `  Disassembly: ${body.services?.disassembly ? `Yes (${body.services.disassemblyItems || "items TBD"})` : "No"}`,
    `  Storage: ${body.services?.storage ? `Yes (${body.services.storageNotes || ""})` : "No"}`,
    ``,
    `DAY-OF CONTACTS:`,
    `  Pickup on-site: ${c?.onSitePickupName || "—"}${c?.onSitePickupPhone ? ` · ${c.onSitePickupPhone}` : ""}`,
    `  Drop-off on-site: ${c?.onSiteDropoffName || "—"}${c?.onSiteDropoffPhone ? ` · ${c.onSiteDropoffPhone}` : ""}`,
    `  Alt phone: ${c?.altPhone || "—"}`,
    `  Pets on site: ${c?.petsOnSite === true ? "Yes" : c?.petsOnSite === false ? "No" : "—"}`,
    `  Kids on site: ${c?.kidsOnSite === true ? "Yes" : c?.kidsOnSite === false ? "No" : "—"}`,
    `  Special instructions: ${c?.specialInstructions || "—"}`,
  ];
  const text = lines.join("\n");

  const results = await Promise.allSettled([
    sendEmail(body, text),
    sendTelegram(text),
  ]);

  const emailed = results[0].status === "fulfilled" && results[0].value === true;
  const telegrammed = results[1].status === "fulfilled" && results[1].value === true;
  if (!emailed && !telegrammed) {
    console.error("[intake] NO channel delivered the intake:", body.email, body.phone);
  }

  return NextResponse.json({ ok: true, emailed, telegrammed, crmed: false });
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
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: `Toro Movers <${from}>`,
        to: [to],
        reply_to: body.email,
        subject: `Move-day intake — ${body.name}${body.moveDate ? ` · ${body.moveDate}` : ""}${resolveMoveTime(body) ? ` · ${formatTime(resolveMoveTime(body))}` : ""}`,
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

async function sendTelegram(text: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return false;
  // Telegram hard limit ~4096 chars; trim inventory middle if needed.
  let payload = text;
  if (payload.length > 4000) {
    payload = payload.slice(0, 3900) + "\n…(truncated — see email for full checklist)";
  }
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: payload, disable_web_page_preview: true }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] || c),
  );
}
