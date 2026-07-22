import { normalizePhone } from "@/lib/verify";

// Shared HubSpot helper used by the funnel + checklist lead routes.
// Upserts the contact (standard + custom props), then creates a Deal in the
// "Mudanzas" pipeline's New Lead stage — but only if the contact has no deal
// yet, so re-submits don't pile up duplicate deals. Fail-soft: any error logs
// and returns false; the lead still flows via email/Telegram/CAPI.

// "Mudanzas" pipeline — created via scripts/hubspot-setup.mjs. Not secret.
export const HS_PIPELINE_ID = "2345196253";
export const HS_STAGE = {
  newLead: "3821600460",
  contactAttempt: "3825414850",
  contacted: "3821600461",
  quoteSent: "3821600462",
  booked: "3821600463",
  completed: "3821600464",
  reviewRequested: "3825414851",
  reviewObtained: "3825293016",
} as const;

// Stage buttons open the site CRM stage endpoint (primary) or legacy n8n hook.
// Prefer NEXT_PUBLIC_SITE_URL so stage moves work without n8n.
// Legacy n8n: docs/n8n-telegram-stage.workflow.json
const STAGE_HOOK =
  process.env.TELEGRAM_STAGE_HOOK_URL ||
  `${process.env.NEXT_PUBLIC_SITE_URL || "https://toromovers.net"}/api/crm/stage`;

/** Inline-keyboard (URL buttons) for the internal Telegram lead alert so the
 *  team can move the deal's stage with one tap. Returns undefined without an
 *  email (no way to target the deal). */
export function telegramStageKeyboard(email?: string) {
  if (!email) return undefined;
  const u = (s: string) => `${STAGE_HOOK}?e=${encodeURIComponent(email)}&s=${s}`;
  return {
    inline_keyboard: [
      [
        { text: "📞 No Answer", url: u("a") },
        { text: "✅ Contacted", url: u("c") },
      ],
      [
        { text: "💲 Quote Sent", url: u("q") },
        { text: "📅 Booked", url: u("b") },
        { text: "🚚 Move Done", url: u("m") },
      ],
      [
        { text: "⭐ Review Sent", url: u("r") },
        { text: "🌟 Review Got", url: u("o") },
      ],
    ],
  };
}

type LeadForHubspot = {
  email: string;
  firstName: string;
  lastName?: string;
  phone?: string;
  city?: string;
  lang?: string;
  funnel: "labor" | "full-service" | "checklist";
  serviceType?: string;
  moveDate?: string;
  utm?: Record<string, string>;
  note: string; // full plain-text summary for the contact record
};

const HS = "https://api.hubapi.com";

export async function upsertLeadToHubspot(lead: LeadForHubspot): Promise<boolean> {
  const token = process.env.HUBSPOT_TOKEN;
  if (!token || !lead.email) return false;
  const h = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const properties: Record<string, string> = {
    email: lead.email,
    firstname: lead.firstName,
    lifecyclestage: "lead",
    // The site fires an instant email + SMS the moment the lead submits, so the
    // automated outreach has already attempted contact — reflect that on entry.
    hs_lead_status: "ATTEMPTED_TO_CONTACT",
    funnel_type: lead.funnel,
    message: lead.note,
  };
  if (lead.lastName) properties.lastname = lead.lastName;
  // Store phone in E.164 so an inbound SMS (Quo sends E.164) can match this
  // contact exactly for the reply → stage-advance automation.
  if (lead.phone) properties.phone = normalizePhone(lead.phone);
  if (lead.city) properties.city = lead.city;
  if (lead.lang) properties.hs_language = lead.lang;
  if (lead.serviceType) properties.service_type = lead.serviceType;
  if (lead.moveDate) properties.move_date = lead.moveDate;
  const u = lead.utm || {};
  for (const k of ["utm_source", "utm_medium", "utm_campaign", "utm_content"] as const) {
    if (u[k]) properties[k] = u[k];
  }

  let contactId: string | undefined;
  try {
    const res = await fetch(`${HS}/crm/v3/objects/contacts/batch/upsert`, {
      method: "POST", headers: h,
      body: JSON.stringify({ inputs: [{ idProperty: "email", id: lead.email, properties }] }),
    });
    if (!res.ok) {
      console.error("[hubspot] contact upsert failed:", res.status, await res.text().catch(() => ""), lead.email);
      return false;
    }
    const data = await res.json().catch(() => null);
    contactId = data?.results?.[0]?.id;
  } catch (err) {
    console.error("[hubspot] contact upsert threw:", err, lead.email);
    return false;
  }

  // Deal: create one in New Lead unless this contact already has a deal.
  if (contactId) {
    try {
      const assoc = await fetch(`${HS}/crm/v3/objects/contacts/${contactId}/associations/deals`, { headers: h });
      const hasDeal = assoc.ok && ((await assoc.json().catch(() => ({})))?.results?.length > 0);
      if (!hasDeal) {
        const dealName = `${lead.firstName} — ${lead.serviceType || lead.funnel}${lead.city ? ` (${lead.city})` : ""}`;
        const dres = await fetch(`${HS}/crm/v3/objects/deals`, {
          method: "POST", headers: h,
          body: JSON.stringify({
            properties: {
              dealname: dealName,
              pipeline: HS_PIPELINE_ID,
              dealstage: HS_STAGE.newLead,
            },
            associations: [{
              to: { id: contactId },
              types: [{ associationCategory: "HUBSPOT_DEFINED", associationTypeId: 3 }],
            }],
          }),
        });
        if (!dres.ok) console.error("[hubspot] deal create failed:", dres.status, await dres.text().catch(() => ""));
      }
    } catch (err) {
      console.error("[hubspot] deal step threw:", err);
      // contact still upserted — treat as success
    }
  }

  return true;
}
