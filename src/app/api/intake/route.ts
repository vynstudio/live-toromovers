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

/** Telegram hard limit is 4096; keep a safety margin. */
const TELEGRAM_MAX = 4096;

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

function yn(v: boolean | null | undefined): string {
  if (v === true) return "Yes";
  if (v === false) return "No";
  return "—";
}

/** Compact one-line endpoint for a single Telegram message. */
function endpointLine(label: string, e?: Endpoint): string {
  if (!e) return `${label}: —`;
  const br = e.bedrooms
    ? e.bedrooms === "Studio"
      ? "Studio"
      : `${e.bedrooms} BR`
    : "";
  const bits = [
    [e.address || "(no address)", e.unit && `Unit ${e.unit}`].filter(Boolean).join(", "),
    e.homeType && (br ? `${e.homeType}, ${br}` : e.homeType),
    e.floor,
    e.elevator === "yes" ? "Elevator" : e.elevator === "no" ? "No elevator" : null,
    e.stairsCount && `${e.stairsCount} stairs`,
    e.parkingNotes && `Park: ${e.parkingNotes}`,
    e.gateCode && `Code: ${e.gateCode}`,
    e.longCarry ? "Long carry ⚠" : null,
    e.accessNotes,
  ].filter(Boolean);
  return `${label}: ${bits.join(" · ")}`;
}

function inventoryCompact(inv?: IntakePayload["inventory"]): string {
  if (!inv) return "—";
  const items = inv.items?.filter((i) => i.qty > 0) || [];
  const total = inv.totalPieces ?? items.reduce((s, i) => s + i.qty, 0);
  const list = items.map((i) => `${i.qty}× ${i.name}`).join(", ");
  const parts = [
    items.length ? `${total} pcs: ${list}` : "no checklist",
    inv.appliances?.length ? `Appliances: ${inv.appliances.join(", ")}` : null,
    inv.other ? `Other: ${inv.other}` : null,
  ].filter(Boolean);
  return parts.join(" | ");
}

/**
 * One compact crew run sheet that must fit in a single Telegram message.
 * If inventory is huge, trim the item list (not other fields).
 */
function buildTelegramText(body: IntakePayload): string {
  const c = body.contacts;
  const service =
    SERVICE_LABELS[body.serviceType || ""] || body.serviceType || "—";
  const packing =
    PACKING_LABELS[body.packing?.status || ""] || body.packing?.status || "—";
  const specials = body.specialItems?.length
    ? body.specialItems.join(", ")
    : "—";
  const specialsLine = body.otherSpecial
    ? `${specials} · ${body.otherSpecial}`
    : specials;

  const onSite =
    c?.onSitePickupName || c?.onSiteDropoffName
      ? [
          c?.onSitePickupName
            ? `PU ${c.onSitePickupName}${c.onSitePickupPhone ? ` ${c.onSitePickupPhone}` : ""}`
            : null,
          c?.onSiteDropoffName
            ? `DO ${c.onSiteDropoffName}${c.onSiteDropoffPhone ? ` ${c.onSiteDropoffPhone}` : ""}`
            : null,
        ]
          .filter(Boolean)
          .join(" · ")
      : c?.onSitePickupPhone || c?.onSiteDropoffPhone || c?.altPhone || "—";

  const head = [
    `📋 MOVE DAY — ${body.name || "Customer"}`,
    `📞 ${body.phone || "—"} · ${body.email || "—"}`,
    `🗓 ${scheduleLine(body)}`,
    `🧰 ${service}`,
    endpointLine("📍 PU", body.origin),
    endpointLine("📍 DO", body.destination),
  ].join("\n");

  const tail = [
    `⚠ Special: ${specialsLine}`,
    `🛠 Packed: ${packing}${body.packing?.needHelp ? " · needs packing help" : ""} · Disassembly: ${body.services?.disassembly ? "Yes" : "No"}`,
    `👥 On-site: ${onSite} · Pets: ${yn(c?.petsOnSite)} · Kids: ${yn(c?.kidsOnSite)}`,
    `📝 ${c?.specialInstructions || "—"}`,
  ].join("\n");

  // Fit inventory in remaining budget so we never split the message.
  const budget = TELEGRAM_MAX - head.length - tail.length - 24; // "\n📦 …\n"
  let inv = inventoryCompact(body.inventory);
  if (inv.length > budget) {
    const items = body.inventory?.items?.filter((i) => i.qty > 0) || [];
    const total =
      body.inventory?.totalPieces ?? items.reduce((s, i) => s + i.qty, 0);
    // Keep top items by qty, then truncate.
    const sorted = [...items].sort((a, b) => b.qty - a.qty);
    let list = "";
    for (const i of sorted) {
      const bit = `${list ? ", " : ""}${i.qty}× ${i.name}`;
      const next = `${total} pcs: ${list}${bit}`;
      if (next.length > Math.max(80, budget - 40)) break;
      list += bit;
    }
    inv = list
      ? `${total} pcs: ${list}…`
      : `${total} pcs (list truncated)`;
    if (body.inventory?.appliances?.length) {
      const a = ` | Appliances: ${body.inventory.appliances.join(", ")}`;
      if (inv.length + a.length <= budget) inv += a;
    }
  }

  return [head, `📦 ${inv}`, tail].join("\n");
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

  const text = buildTelegramText(body);
  // Hard guarantee: one Telegram message only.
  const telegramText =
    text.length <= TELEGRAM_MAX
      ? text
      : text.slice(0, TELEGRAM_MAX - 1) + "…";

  const results = await Promise.allSettled([
    sendEmail(body, text),
    sendTelegram(telegramText),
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
    chars: telegramText.length,
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

async function sendTelegram(text: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return false;
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
    if (!res.ok) {
      console.error("[intake] Telegram failed:", await res.text().catch(() => ""));
      return false;
    }
    return true;
  } catch (err) {
    console.error("[intake] Telegram threw:", err);
    return false;
  }
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] || c),
  );
}
