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
  contacted: "3821600461",
  quoteSent: "3821600462",
  booked: "3821600463",
  completed: "3821600464",
  won: "3821600465",
  lost: "3821600466",
} as const;

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
