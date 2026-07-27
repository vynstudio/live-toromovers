/**
 * HubSpot integration REMOVED (2026-07-27).
 * Stubs kept only so accidental imports fail soft instead of breaking builds.
 * Do not re-add HUBSPOT_TOKEN or pipeline automation without a full redesign.
 */

export const HS_PIPELINE_ID = "";
export const HS_STAGE = {
  newLead: "",
  contactAttempt: "",
  contacted: "",
  quoteSent: "",
  booked: "",
  completed: "",
  reviewRequested: "",
  reviewObtained: "",
} as const;

export function telegramStageKeyboard(_email?: string): undefined {
  return undefined;
}

export async function upsertLeadToHubspot(_lead: unknown): Promise<boolean> {
  return false;
}
