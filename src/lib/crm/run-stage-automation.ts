/**
 * Fire SMS/email for a HubSpot stage step (instant or delayed).
 */

import { sendEmail, sendSms } from "./providers";
import {
  buildStageStepCopy,
  getInstantSteps,
  getStagePlan,
  type StageSmsStep,
} from "./stage-sms-plan";
import type { StageKey } from "./types";

export type StageAutomationOpts = {
  stage: StageKey;
  firstName: string;
  email?: string;
  phone?: string;
  lang?: "en" | "es";
  /** If set, only run this step id (for delayed n8n calls) */
  stepId?: string;
  /** Default true for SMS when phone present */
  consentSms?: boolean;
  consentEmail?: boolean;
};

export type StepResult = {
  stepId: string;
  channel: string;
  ok: boolean;
  detail?: string;
};

export async function runStageStep(
  step: StageSmsStep,
  opts: StageAutomationOpts,
): Promise<StepResult[]> {
  const copy = buildStageStepCopy(step.id, {
    firstName: opts.firstName,
    lang: opts.lang,
  });
  const results: StepResult[] = [];
  const wantSms = step.channel === "sms" || step.channel === "both";
  const wantEmail = step.channel === "email" || step.channel === "both";

  if (wantSms) {
    if (opts.consentSms === false) {
      results.push({
        stepId: step.id,
        channel: "sms",
        ok: false,
        detail: "no SMS consent",
      });
    } else if (!opts.phone) {
      results.push({
        stepId: step.id,
        channel: "sms",
        ok: false,
        detail: "no phone",
      });
    } else if (!copy.sms) {
      results.push({
        stepId: step.id,
        channel: "sms",
        ok: false,
        detail: "no sms copy",
      });
    } else {
      const r = await sendSms(opts.phone, copy.sms);
      results.push({
        stepId: step.id,
        channel: "sms",
        ok: r.ok,
        detail: r.detail,
      });
    }
  }

  if (wantEmail) {
    if (opts.consentEmail === false) {
      results.push({
        stepId: step.id,
        channel: "email",
        ok: false,
        detail: "no email consent",
      });
    } else if (!opts.email) {
      results.push({
        stepId: step.id,
        channel: "email",
        ok: false,
        detail: "no email",
      });
    } else if (!copy.email) {
      results.push({
        stepId: step.id,
        channel: "email",
        ok: false,
        detail: "no email copy",
      });
    } else {
      const r = await sendEmail({
        to: opts.email,
        subject: copy.email.subject,
        text: copy.email.text,
        html: copy.email.text.replace(/\n/g, "<br/>"),
        replyTo: process.env.RESEND_FROM_EMAIL || "hello@toromovers.net",
      });
      results.push({
        stepId: step.id,
        channel: "email",
        ok: r.ok,
        detail: r.detail,
      });
    }
  }

  return results;
}

/** Instant steps when entering a stage (delayMinutes === 0) */
export async function runInstantStageAutomation(
  opts: StageAutomationOpts,
): Promise<StepResult[]> {
  const steps = getInstantSteps(opts.stage);
  const all: StepResult[] = [];
  for (const step of steps) {
    all.push(...(await runStageStep(step, opts)));
  }
  return all;
}

/** Single delayed step by id */
export async function runDelayedStageStep(
  opts: StageAutomationOpts & { stepId: string },
): Promise<StepResult[]> {
  const plan = getStagePlan(opts.stage);
  const step = plan?.steps.find((s) => s.id === opts.stepId);
  if (!step) {
    return [
      {
        stepId: opts.stepId,
        channel: "system",
        ok: false,
        detail: "unknown step",
      },
    ];
  }
  return runStageStep(step, opts);
}

/** Payload n8n should schedule after instant send */
export function delayedStepsForN8n(stage: StageKey) {
  return getStagePlan(stage)?.steps.filter((s) => s.delayMinutes > 0) || [];
}
