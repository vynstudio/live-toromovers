/**
 * EXTERNAL AUTOMATION — HARD OFF (incident 2026-07-27, reinforced 2026-07-27).
 *
 * Default: n8n drips, HubSpot-driven automations, and multi-SMS stage plans
 * are ALL dead until we rebuild from scratch.
 *
 * Only allowed client SMS: one Quo confirmation that the quote request was
 * received (see quote-confirmation.ts).
 *
 * Opt-in later (do NOT set until intentionally redesigned):
 *   FOLLOWUP_AUTOMATION=1  — stage/drip SMS+email on our server
 *   N8N_ENABLED=1          — site may POST to n8n webhooks
 *   HUBSPOT_SYNC=1         — site may create/update HubSpot contacts+deals
 */

export function followupAutomationDisabled(): boolean {
  return process.env.FOLLOWUP_AUTOMATION !== "1";
}

export function n8nDisabled(): boolean {
  // n8n off unless explicitly re-enabled (stricter than followup alone)
  return process.env.N8N_ENABLED !== "1";
}

export function hubspotSyncDisabled(): boolean {
  return process.env.HUBSPOT_SYNC !== "1";
}

export function followupDisabledReason(): string {
  return "automation_killed — redo from scratch; only quote-received SMS via Quo is allowed";
}

export function n8nDisabledReason(): string {
  return "n8n_disabled — set N8N_ENABLED=1 only after redesign";
}

export function hubspotDisabledReason(): string {
  return "hubspot_sync_disabled — set HUBSPOT_SYNC=1 only after redesign";
}
