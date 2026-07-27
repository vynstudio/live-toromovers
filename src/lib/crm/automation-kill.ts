/**
 * External CRM automation (HubSpot / n8n / multi-SMS) is REMOVED.
 * These helpers always report disabled — no env re-enable path.
 */

export function followupAutomationDisabled(): boolean {
  return true;
}

export function n8nDisabled(): boolean {
  return true;
}

export function hubspotSyncDisabled(): boolean {
  return true;
}

export function followupDisabledReason(): string {
  return "hubspot_and_n8n_removed — quote confirmation SMS via Quo only";
}

export function n8nDisabledReason(): string {
  return "n8n_removed";
}

export function hubspotDisabledReason(): string {
  return "hubspot_removed";
}
