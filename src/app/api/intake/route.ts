import { NextResponse } from "next/server";

type Endpoint = {
  address?: string;
  homeType?: string;
  bedrooms?: string;
  floor?: string;
  elevator?: string;
  stairsCount?: string;
  parkingNotes?: string;
  hoaNotice?: boolean;
  coiNeeded?: boolean;
  accessNotes?: string;
};

type IntakePayload = {
  name?: string;
  phone?: string;
  email?: string;
  moveDate?: string;
  origin?: Endpoint;
  destination?: Endpoint;
  inventory?: { boxes?: string; largeItems?: string; awkward?: string };
  specialItems?: string[];
  otherSpecial?: string;
  services?: {
    packing?: boolean; packingScope?: string;
    supplies?: boolean;
    disassembly?: boolean; disassemblyItems?: string;
    storage?: boolean; storageNotes?: string;
  };
  contacts?: { altPhone?: string; specialInstructions?: string };
};

function endpointSummary(e?: Endpoint): string {
  if (!e) return "—";
  const br = e.bedrooms ? (e.bedrooms === "Studio" ? "Studio" : `${e.bedrooms} BR`) : "";
  const parts = [
    e.address || "(no address)",
    e.homeType && (br ? `${e.homeType}, ${br}` : e.homeType),
    e.floor,
    e.elevator === "yes" ? "Elevator ✓" : e.elevator === "no" ? "No elevator" : null,
    e.stairsCount && `${e.stairsCount} stairs`,
    e.parkingNotes && `Parking: ${e.parkingNotes}`,
    e.hoaNotice ? "HOA notified ✓" : null,
    e.coiNeeded ? "COI required ⚠" : null,
    e.accessNotes && `Access: ${e.accessNotes}`,
  ].filter(Boolean);
  return parts.join("\n  ");
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as IntakePayload | null;
  if (!body || !body.name || !body.phone || !body.email) {
    return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 400 });
  }

  const lines: string[] = [
    `📋 Move-day intake — Toro Movers`,
    ``,
    `Name: ${body.name}`,
    `Phone: ${body.phone}`,
    `Email: ${body.email}`,
    `Move date: ${body.moveDate || "—"}`,
    ``,
    `PICKUP:`,
    `  ${endpointSummary(body.origin)}`,
    ``,
    `DROP-OFF:`,
    `  ${endpointSummary(body.destination)}`,
    ``,
    `Inventory: ${body.inventory?.boxes || "?"} boxes · ${body.inventory?.largeItems || "?"} large pieces`,
    `Awkward: ${body.inventory?.awkward || "—"}`,
    ``,
    `Special items: ${
      (body.specialItems && body.specialItems.length)
        ? body.specialItems.join(", ")
        : "—"
    }${body.otherSpecial ? ` · other: ${body.otherSpecial}` : ""}`,
    ``,
    `Services:`,
    `  Packing: ${body.services?.packing ? `Yes (${body.services.packingScope || "scope TBD"})` : "No"}`,
    `  Supplies: ${body.services?.supplies ? "Yes" : "No"}`,
    `  Disassembly: ${body.services?.disassembly ? `Yes (${body.services.disassemblyItems || "items TBD"})` : "No"}`,
    `  Storage: ${body.services?.storage ? `Yes (${body.services.storageNotes || ""})` : "No"}`,
    ``,
    `Day-of contacts:`,
    `  Alt phone: ${body.contacts?.altPhone || "—"}`,
    `  Special instructions: ${body.contacts?.specialInstructions || "—"}`,
  ];
  const text = lines.join("\n");

  const results = await Promise.allSettled([
    sendEmail(body, text),
    sendTelegram(text),
    upsertHubspotContact(body, text),
  ]);

  const emailed = results[0].status === "fulfilled" && results[0].value === true;
  const telegrammed = results[1].status === "fulfilled" && results[1].value === true;
  const crmed = results[2].status === "fulfilled" && results[2].value === true;
  if (!emailed && !telegrammed) {
    console.error("[intake] NO channel delivered the intake:", body.email, body.phone);
  }

  return NextResponse.json({ ok: true, emailed, telegrammed, crmed });
}

async function sendEmail(body: IntakePayload, text: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL || "hello@toromovers.net";
  const to =
    process.env.BOOKING_NOTIFICATION_EMAIL ||
    process.env.LEAD_NOTIFICATION_EMAIL ||
    from;
  if (!apiKey) return false;

  const html = `
  <div style="max-width:640px;margin:0 auto;padding:28px 24px;background:#ffffff;font:14px/1.55 system-ui,sans-serif;color:#0A0A0A">
    <h2 style="font:600 18px/1.3 system-ui,sans-serif;margin:0 0 12px">Move-day intake — ${body.name}</h2>
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
        subject: `Move-day intake — ${body.name}${body.moveDate ? ` · ${body.moveDate}` : ""}`,
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
      body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Upsert the intake into HubSpot, keyed by email — so it updates the SAME
 *  contact the quote already created instead of duplicating. Mirrors the
 *  booking route. Gated on HUBSPOT_TOKEN, fails soft. */
async function upsertHubspotContact(body: IntakePayload, text: string): Promise<boolean> {
  const token = process.env.HUBSPOT_TOKEN;
  if (!token || !body.email) return false;

  const [firstname, ...rest] = (body.name || "").trim().split(/\s+/);
  const properties: Record<string, string> = {
    email: body.email,
    lifecyclestage: "lead",
    hs_lead_status: "NEW",
    message: text, // full move-day intake lands on the contact record
  };
  if (firstname) properties.firstname = firstname;
  if (rest.length) properties.lastname = rest.join(" ");
  if (body.phone) properties.phone = body.phone;

  try {
    const res = await fetch(
      "https://api.hubapi.com/crm/v3/objects/contacts/batch/upsert",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: [{ idProperty: "email", id: body.email, properties }],
        }),
      },
    );
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("[intake] HubSpot failed:", res.status, detail, "lead:", body.email);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[intake] HubSpot threw:", err, "lead:", body.email);
    return false;
  }
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] || c),
  );
}
