/**
 * HubSpot stage advances REMOVED.
 * Endpoint remains so old Telegram/n8n links get a clean error, not spam.
 */

import type { StepResult } from "./run-stage-automation";
import type { StageKey } from "./types";

export const STAGE_SHORT: Record<string, StageKey> = {
  a: "contactAttempt",
  c: "contacted",
  q: "quoteSent",
  b: "booked",
  m: "completed",
  r: "reviewRequested",
  o: "reviewObtained",
};

export type AdvanceResult = {
  ok: boolean;
  stage?: StageKey;
  stageId?: string;
  contactId?: string;
  dealIds?: string[];
  error?: string;
  automations?: StepResult[];
  delayedSteps?: { id: string; delayMinutes: number; channel: string }[];
};

export async function advanceStage(_opts: {
  email?: string;
  phone?: string;
  stage: StageKey | string;
  notifyTelegram?: boolean;
  label?: string;
  firstName?: string;
  lang?: "en" | "es";
  consentSms?: boolean;
  consentEmail?: boolean;
  skipAutomations?: boolean;
}): Promise<AdvanceResult> {
  return {
    ok: false,
    error: "hubspot_removed — stage automation disabled permanently",
    automations: [],
    delayedSteps: [],
  };
}
