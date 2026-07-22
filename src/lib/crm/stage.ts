/**
 * Advance HubSpot deal stage by email or phone.
 * Used by Telegram buttons (via n8n or direct), OpenPhone inbound, manual tools.
 */

import { HS_PIPELINE_ID, HS_STAGE } from "@/lib/hubspot";
import {
  hsGetDealIdsForContact,
  hsPatchContact,
  hsPatchDeal,
  hsSearchContactByEmail,
  hsSearchContactByPhone,
  sendTelegram,
} from "./providers";
import type { StageKey } from "./types";

// Short codes used in Telegram URL buttons (see hubspot.ts telegramStageKeyboard)
export const STAGE_SHORT: Record<string, StageKey> = {
  a: "contactAttempt", // no answer
  c: "contacted",
  q: "quoteSent",
  b: "booked",
  m: "completed", // move done
  r: "reviewRequested",
  o: "reviewObtained",
};

const LEAD_STATUS: Partial<Record<StageKey, string>> = {
  newLead: "NEW",
  contactAttempt: "ATTEMPTED_TO_CONTACT",
  contacted: "CONNECTED",
  quoteSent: "CONNECTED",
  booked: "CONNECTED",
  completed: "CONNECTED",
  reviewRequested: "CONNECTED",
  reviewObtained: "CONNECTED",
};

export type AdvanceResult = {
  ok: boolean;
  stage?: StageKey;
  stageId?: string;
  contactId?: string;
  dealIds?: string[];
  error?: string;
};

export async function advanceStage(opts: {
  email?: string;
  phone?: string;
  stage: StageKey | string; // full key or short code
  notifyTelegram?: boolean;
  label?: string;
}): Promise<AdvanceResult> {
  if (!process.env.HUBSPOT_TOKEN) {
    return { ok: false, error: "HUBSPOT_TOKEN missing" };
  }

  const stageKey: StageKey =
    (STAGE_SHORT[opts.stage] as StageKey) ||
    (opts.stage as StageKey);
  const stageId = HS_STAGE[stageKey as keyof typeof HS_STAGE];
  if (!stageId) {
    return { ok: false, error: `unknown stage: ${opts.stage}` };
  }

  let contactId: string | null = null;
  if (opts.email) {
    contactId = await hsSearchContactByEmail(opts.email);
  }
  if (!contactId && opts.phone) {
    contactId = await hsSearchContactByPhone(opts.phone);
  }
  if (!contactId) {
    return { ok: false, error: "contact not found" };
  }

  const dealIds = await hsGetDealIdsForContact(contactId);
  if (dealIds.length === 0) {
    // Still update contact lead status
    const ls = LEAD_STATUS[stageKey];
    if (ls) await hsPatchContact(contactId, { hs_lead_status: ls });
    return {
      ok: false,
      error: "no deal on contact",
      contactId,
      stage: stageKey,
      stageId,
    };
  }

  let any = false;
  for (const dealId of dealIds) {
    const ok = await hsPatchDeal(dealId, {
      pipeline: HS_PIPELINE_ID,
      dealstage: stageId,
    });
    if (ok) any = true;
  }

  const ls = LEAD_STATUS[stageKey];
  if (ls) await hsPatchContact(contactId, { hs_lead_status: ls });

  if (opts.notifyTelegram && any) {
    await sendTelegram(
      `📌 Stage → ${opts.label || stageKey}\nContact: ${opts.email || opts.phone || contactId}`,
    );
  }

  return {
    ok: any,
    stage: stageKey,
    stageId,
    contactId,
    dealIds,
  };
}
