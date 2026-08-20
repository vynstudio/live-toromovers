/**
 * Lead intake — minimal.
 *
 * - Telegram team alert
 * - One Quo SMS: quote received, we'll contact soon
 *
 * HubSpot and n8n are fully removed (not feature-flagged).
 */

import { normalizePhone } from "@/lib/verify";
import { sendTelegram } from "./providers";
import { sendQuoteReceivedConfirmation } from "./quote-confirmation";
import type { ChannelResult, CrmLead, Funnel } from "./types";

export type IntakeResult = {
  ok: boolean;
  channels: ChannelResult[];
  contactId?: string | null;
};

function firstNameOf(name: string) {
  return name.trim().split(/\s+/)[0] || "there";
}

function isPriorityLead(lead: CrmLead): boolean {
  const blob = `${lead.note || ""} ${lead.moveDate || ""}`.toLowerCase();
  return (
    blob.includes("priority") ||
    blob.includes("this week") ||
    blob.includes("esta semana") ||
    blob.includes("asap")
  );
}

function isAgentLead(lead: CrmLead): boolean {
  const blob = `${lead.source} ${lead.landingPage || ""} ${lead.note || ""}`.toLowerCase();
  return (
    blob.includes("get-my-price") ||
    blob.includes("get-a-quote") ||
    blob.includes("agent funnel")
  );
}

function summarize(lead: CrmLead): string {
  const phone = lead.phone ? normalizePhone(lead.phone) : "—";
  const priority = isPriorityLead(lead);
  const agent = isAgentLead(lead);
  return [
    priority
      ? `🔥 PRIORITY — call ASAP · ${lead.funnel.toUpperCase()}`
      : agent
        ? `⚡ Agent lead · ${lead.funnel.toUpperCase()}`
        : `🚚 New ${lead.funnel.toUpperCase()} lead`,
    ``,
    `Name: ${lead.firstName}${lead.lastName ? ` ${lead.lastName}` : ""}`,
    `Phone: ${phone}`,
    `Email: ${lead.email || "—"}`,
    `City: ${lead.city || "—"}`,
    `Move date: ${lead.moveDate || "—"}`,
    `Service: ${lead.serviceType || lead.funnel}`,
    `Source: ${lead.source}`,
    `Lang: ${lead.lang || "en"}`,
    lead.landingPage ? `Landing: ${lead.landingPage}` : "",
    lead.utm
      ? `UTM: ${Object.entries(lead.utm)
          .filter(([, v]) => v)
          .map(([k, v]) => `${k}=${v}`)
          .join(" · ")}`
      : "",
    lead.note ? `\nNote: ${lead.note}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export async function intakeLead(lead: CrmLead): Promise<IntakeResult> {
  const channels: ChannelResult[] = [];
  const text = summarize(lead);
  const phone = lead.phone ? normalizePhone(lead.phone) : "";

  // 1) Team alert
  channels.push(await sendTelegram(text));

  // 2) One client SMS (skip soft-capture mid-funnel)
  const isSoftCapture = /soft capture|pending qualify|still qualifying/i.test(
    `${lead.note || ""} ${lead.serviceType || ""}`,
  );
  if (isSoftCapture) {
    channels.push({
      ok: true,
      channel: "openphone",
      detail: "skipped_soft_capture_no_sms",
    });
  } else {
    const confirm = await sendQuoteReceivedConfirmation({
      firstName: lead.firstName,
      phone: phone || undefined,
      lang: lead.lang,
      consentSms: lead.consentSms === false ? false : true,
    });
    channels.push({
      ...confirm,
      detail:
        confirm.detail || (confirm.ok ? "quote_received_sms" : "sms_skipped"),
    });
  }

  return {
    ok: channels.some((c) => c.ok),
    channels,
    contactId: null,
  };
}

export function parseLooseLead(body: Record<string, unknown>): CrmLead | null {
  const firstName =
    String(body.firstName || body.first_name || body.name || "")
      .trim()
      .split(/\s+/)[0] || "";
  const lastName =
    String(body.lastName || body.last_name || "").trim() || undefined;
  const full = String(body.name || "").trim();
  const fn = firstName || firstNameOf(full);
  if (!fn) return null;

  const email = String(body.email || "").trim() || undefined;
  const phone =
    String(body.phone || body.phone_number || "").trim() || undefined;
  if (!email && !phone) return null;

  const funnel = (String(body.funnel || body.funnel_type || "full-service") ||
    "full-service") as Funnel;

  return {
    firstName: fn,
    lastName:
      lastName ||
      (full.includes(" ")
        ? full.split(/\s+/).slice(1).join(" ") || undefined
        : undefined),
    email,
    phone,
    city: String(body.city || body.from_zip || "").trim() || undefined,
    lang: body.lang === "es" ? "es" : "en",
    funnel,
    source: (String(body.source || "website") || "website") as CrmLead["source"],
    serviceType: String(body.serviceType || body.service_type || "").trim() || undefined,
    moveDate: String(body.moveDate || body.move_date || "").trim() || undefined,
    note: String(body.note || body.message || "").trim() || undefined,
    utm:
      body.utm && typeof body.utm === "object"
        ? (body.utm as Record<string, string>)
        : undefined,
    landingPage:
      String(body.landingPage || body.landing_page || "").trim() || undefined,
    consentSms:
      body.consentSms === true ||
      body.consent_sms === true ||
      body.smsOptIn === true,
    consentEmail: body.consentEmail !== false && body.consent_email !== false,
  };
}
