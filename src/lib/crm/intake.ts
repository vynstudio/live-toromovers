/**
 * Unified lead intake.
 *
 * LIVE (until redesign):
 *  - Telegram alert to the team
 *  - ONE Quo SMS: "we got your quote, we'll contact soon"
 *
 * KILLED:
 *  - HubSpot contact/deal sync (unless HUBSPOT_SYNC=1)
 *  - n8n webhooks (unless N8N_ENABLED=1)
 *  - Multi-step stage SMS/email plans
 */

import { normalizePhone } from "@/lib/verify";
import {
  HS_PIPELINE_ID,
  HS_STAGE,
  upsertLeadToHubspot,
} from "@/lib/hubspot";
import {
  sendTelegram,
  hsSearchContactByPhone,
  hsCreateContact,
  hsCreateDeal,
  hsGetDealIdsForContact,
  hsPatchContact,
} from "./providers";
import {
  hubspotDisabledReason,
  hubspotSyncDisabled,
  n8nDisabled,
  n8nDisabledReason,
} from "./automation-kill";
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
  return blob.includes("get-my-price") || blob.includes("agent funnel");
}

function summarize(lead: CrmLead): string {
  const phone = lead.phone ? normalizePhone(lead.phone) : "—";
  const priority = isPriorityLead(lead);
  const agent = isAgentLead(lead);
  return [
    priority
      ? `🔥 PRIORITY — call ASAP · ${lead.funnel.toUpperCase()}`
      : agent
        ? `⚡ Agent lead · ${lead.funnel.toUpperCase()} — Toro CRM`
        : `🚚 New ${lead.funnel.toUpperCase()} lead — Toro CRM`,
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

/** Phone-only leads (Meta Call Now) — HubSpot without email. */
async function upsertPhoneOnlyLead(lead: CrmLead): Promise<string | null> {
  if (!lead.phone || !process.env.HUBSPOT_TOKEN) return null;
  const phone = normalizePhone(lead.phone);
  let contactId = await hsSearchContactByPhone(phone);
  const properties: Record<string, string> = {
    firstname: lead.firstName,
    phone,
    lifecyclestage: "lead",
    hs_lead_status: "NEW",
    funnel_type: lead.funnel === "call" ? "full-service" : lead.funnel,
    message: lead.note || summarize(lead),
  };
  if (lead.lastName) properties.lastname = lead.lastName;
  if (lead.city) properties.city = lead.city;
  if (lead.serviceType) properties.service_type = lead.serviceType;
  if (lead.moveDate) properties.move_date = lead.moveDate;

  if (contactId) {
    await hsPatchContact(contactId, properties);
  } else {
    contactId = await hsCreateContact(properties);
  }
  if (!contactId) return null;

  const deals = await hsGetDealIdsForContact(contactId);
  if (deals.length === 0) {
    await hsCreateDeal({
      dealname: `${lead.firstName} — ${lead.serviceType || lead.funnel}${lead.city ? ` (${lead.city})` : ""}`,
      pipeline: HS_PIPELINE_ID,
      dealstage: HS_STAGE.newLead,
      contactId,
    });
  }
  return contactId;
}

export async function intakeLead(lead: CrmLead): Promise<IntakeResult> {
  const channels: ChannelResult[] = [];
  const text = summarize(lead);
  const phone = lead.phone ? normalizePhone(lead.phone) : "";
  const email = lead.email?.trim().toLowerCase();

  // 1) HubSpot — OFF until redesign
  let contactId: string | null = null;
  if (hubspotSyncDisabled()) {
    channels.push({
      ok: false,
      channel: "hubspot",
      detail: hubspotDisabledReason(),
    });
  } else if (email) {
    const ok = await upsertLeadToHubspot({
      email,
      firstName: lead.firstName,
      lastName: lead.lastName,
      phone: phone || undefined,
      city: lead.city,
      lang: lead.lang,
      funnel:
        lead.funnel === "labor" ||
        lead.funnel === "full-service" ||
        lead.funnel === "checklist"
          ? lead.funnel
          : "full-service",
      serviceType: lead.serviceType,
      moveDate: lead.moveDate,
      utm: lead.utm,
      note: text,
    });
    channels.push({
      ok,
      channel: "hubspot",
      detail: ok ? "upsert email" : "failed",
    });
  } else if (phone) {
    contactId = await upsertPhoneOnlyLead(lead);
    channels.push({
      ok: Boolean(contactId),
      channel: "hubspot",
      detail: contactId ? "upsert phone" : "failed phone-only",
    });
  } else {
    channels.push({
      ok: false,
      channel: "hubspot",
      detail: "no email or phone",
    });
  }

  // 2) Team alert — Telegram only (NO stage buttons → those drove HubSpot + SMS chains)
  const tg = await sendTelegram(text);
  channels.push(tg);

  // 3) Client: ONE confirmation SMS via Quo only (no email drip, no stage plan)
  // Soft capture (name+phone mid-funnel) must NOT text — full submit will.
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
      // Form consent; Meta call leads: allow unless explicitly false
      consentSms: lead.consentSms === false ? false : true,
    });
    channels.push({
      ...confirm,
      detail:
        confirm.detail || (confirm.ok ? "quote_received_sms" : "sms_skipped"),
    });
  }

  // 4) n8n — never queue
  if (n8nDisabled()) {
    channels.push({ ok: false, channel: "n8n", detail: n8nDisabledReason() });
  }

  const ok = channels.some((c) => c.ok);
  return { ok, channels, contactId };
}

export function parseLooseLead(body: Record<string, unknown>): CrmLead | null {
  const firstName =
    String(body.firstName || body.first_name || body.name || "")
      .trim()
      .split(/\s+/)[0] || "";
  const lastName = String(body.lastName || body.last_name || "").trim() || undefined;
  const full = String(body.name || "").trim();
  const fn = firstName || firstNameOf(full);
  if (!fn) return null;

  const email = String(body.email || "").trim() || undefined;
  const phone = String(body.phone || body.phone_number || "").trim() || undefined;
  if (!email && !phone) return null;

  const funnel = (String(body.funnel || body.funnel_type || "full-service") ||
    "full-service") as Funnel;

  return {
    firstName: fn,
    lastName:
      lastName ||
      (full.includes(" ") ? full.split(/\s+/).slice(1).join(" ") : undefined),
    email,
    phone,
    city: String(body.city || "").trim() || undefined,
    lang: body.lang === "es" ? "es" : "en",
    funnel: [
      "labor",
      "full-service",
      "checklist",
      "call",
      "booking",
      "manual",
      "other",
    ].includes(funnel)
      ? funnel
      : "full-service",
    source: (String(body.source || "manual") as CrmLead["source"]) || "manual",
    serviceType: String(body.serviceType || body.service_type || "").trim() || undefined,
    moveDate: String(body.moveDate || body.move_date || "").trim() || undefined,
    note: String(body.note || body.message || "").trim() || undefined,
    landingPage: String(body.landingPage || body.landing_page || "").trim() || undefined,
    consentSms:
      body.consentSms === true ||
      body.smsConsent === true ||
      body.consent_sms === true,
    consentEmail: body.consentEmail !== false,
    utm:
      typeof body.utm === "object" && body.utm
        ? (body.utm as Record<string, string>)
        : undefined,
  };
}
