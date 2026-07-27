/**
 * GLOBAL KILL SWITCH — customer SMS/email follow-up automation.
 *
 * Default: DISABLED (after mass SMS incident 2026-07-27).
 * To re-enable intentionally after review:
 *   FOLLOWUP_AUTOMATION=1
 *
 * Covers:
 *  - Instant stage SMS/email (new lead, stage advance)
 *  - Delayed n8n → /api/crm/sequences/stage-run
 *  - n8n CRM / funnel / checklist drip webhooks from the site
 */

export function followupAutomationDisabled(): boolean {
  // Explicit opt-in only. Empty / unset / "0" / "false" = OFF.
  return process.env.FOLLOWUP_AUTOMATION !== "1";
}

export function followupDisabledReason(): string {
  return "followup_automation_disabled — set FOLLOWUP_AUTOMATION=1 to re-enable";
}
