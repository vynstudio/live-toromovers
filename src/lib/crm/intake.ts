/**
 * Unified CRM intake — every lead channel lands here.
 * HubSpot contact + deal · Telegram · Resend · OpenPhone · optional n8n.
 */

import { normalizePhone } from "@/lib/verify";
import {
  HS_PIPELINE_ID,
  HS_STAGE,
  telegramStageKeyboard,
  upsertLeadToHubspot,
} from "@/lib/hubspot";
import {
  sendEmail,
  sendSms,
  sendTelegram,
  sendTeamEmail,
  hsSearchContactByPhone,
  hsCreateContact,
  hsCreateDeal,
  hsGetDealIdsForContact,
  hsPatchContact,
} from "./providers";
import { buildSequence } from "./sequences";
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

function instantSequenceKey(lead: CrmLead): "call_instant" | "agent_instant" | "followup_1h" {
  if (lead.source === "meta_call") return "call_instant";
  if (isAgentLead(lead)) return "agent_instant";
  return "followup_1h";
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

  // 1) HubSpot
  let contactId: string | null = null;
  if (email) {
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

  // 2) Telegram (with stage keyboard when email known)
  const tg = await sendTelegram(
    text,
    telegramStageKeyboard(email),
  );
  channels.push(tg);

  // 3) Team email
  const team = await sendTeamEmail(
    `${lead.funnel} lead: ${lead.firstName}${lead.city ? ` · ${lead.city}` : ""}`,
    `<pre style="white-space:pre-wrap;font:13px/1.5 ui-monospace,Menlo,monospace">${text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")}</pre>`,
    text,
  );
  channels.push(team);

  // 4) Customer instant touch (email + SMS when consented / call funnel)
  const seqKey = instantSequenceKey(lead);
  const wantsCustomerComms =
    lead.source === "meta_call" ||
    lead.source === "manual" ||
    lead.consentEmail !== false;
  if (wantsCustomerComms && email) {
    const seq = buildSequence(seqKey, {
      firstName: lead.firstName,
      lang: lead.lang,
      funnel: lead.funnel,
    });
    if (seq.email) {
      channels.push(
        await sendEmail({
          to: email,
          subject: seq.email.subject,
          html: seq.email.html,
          text: seq.email.text,
          replyTo: process.env.RESEND_FROM_EMAIL || "hello@toromovers.net",
        }),
      );
    }
  }

  const wantsSms =
    Boolean(phone) &&
    (lead.consentSms === true ||
      lead.source === "meta_call" ||
      lead.funnel === "call");
  if (wantsSms && phone) {
    const seq = buildSequence(seqKey, {
      firstName: lead.firstName,
      lang: lead.lang,
      funnel: lead.funnel,
    });
    if (seq.sms) {
      channels.push(await sendSms(phone, seq.sms));
    }
  }

  // 5) n8n drip (optional)
  const n8nUrl = process.env.N8N_FUNNEL_WEBHOOK_URL || process.env.N8N_CRM_WEBHOOK_URL;
  if (n8nUrl) {
    try {
      const secret = process.env.N8N_WEBHOOK_SECRET;
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 2500);
      const res = await fetch(n8nUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(secret ? { "x-toro-secret": secret } : {}),
        },
        body: JSON.stringify({
          event: "crm_lead",
          funnel: lead.funnel,
          source: lead.source,
          firstName: lead.firstName,
          lastName: lead.lastName,
          email,
          phone,
          city: lead.city,
          moveDate: lead.moveDate,
          serviceType: lead.serviceType,
          lang: lead.lang || "en",
          consentSms: lead.consentSms,
          consentEmail: lead.consentEmail,
          utm: lead.utm,
          landingPage: lead.landingPage,
          note: lead.note,
        }),
        signal: ctrl.signal,
      });
      clearTimeout(t);
      channels.push({
        ok: res.ok,
        channel: "n8n",
        detail: res.ok ? "queued" : `HTTP ${res.status}`,
      });
    } catch {
      channels.push({ ok: false, channel: "n8n", detail: "timeout/error" });
    }
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
