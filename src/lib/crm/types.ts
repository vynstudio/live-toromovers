/** Toro Movers CRM — shared types */

export type Funnel =
  | "labor"
  | "full-service"
  | "checklist"
  | "call"
  | "booking"
  | "manual"
  | "other";

export type LeadSource =
  | "meta_call"
  | "meta_form"
  | "website"
  | "funnel"
  | "checklist"
  | "booking"
  | "openphone_inbound"
  | "manual"
  | "other";

/** HubSpot Mudanzas pipeline stages (ids in hubspot.ts HS_STAGE) */
export type StageKey =
  | "newLead"
  | "contactAttempt"
  | "contacted"
  | "quoteSent"
  | "booked"
  | "completed"
  | "reviewRequested"
  | "reviewObtained";

export type CrmLead = {
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
  city?: string;
  lang?: "en" | "es";
  funnel: Funnel;
  source: LeadSource;
  serviceType?: string;
  moveDate?: string;
  note?: string;
  utm?: Record<string, string>;
  landingPage?: string;
  consentSms?: boolean;
  consentEmail?: boolean;
};

export type SequenceKey =
  | "funnel_instant" // already handled in funnel-lead
  | "call_instant" // after call ad / missed → still notify CRM
  | "agent_instant" // /get-my-price phone-first agent
  | "followup_1h"
  | "followup_24h"
  | "followup_72h"
  | "booked_confirm"
  | "move_day_eve"
  | "post_move_review"
  | "nurture_checklist";

export type ChannelResult = {
  ok: boolean;
  channel: "hubspot" | "resend" | "openphone" | "telegram" | "n8n";
  detail?: string;
};
