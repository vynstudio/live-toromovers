import { NextResponse } from "next/server";
import { runDelayedStageStep } from "@/lib/crm/run-stage-automation";
import type { StageKey } from "@/lib/crm/types";

/**
 * Fire one delayed stage SMS/email step (called by n8n Wait nodes).
 *
 * Auth: x-lead-secret === LEAD_INTAKE_SECRET  OR  x-toro-secret === N8N_WEBHOOK_SECRET
 *
 * POST {
 *   stage: "newLead" | "contactAttempt" | ...,
 *   stepId: "new_1h" | "quote_24h" | ...,
 *   firstName, email?, phone?, lang?,
 *   consentSms?, consentEmail?
 * }
 */
export async function POST(req: Request) {
  const secret = process.env.LEAD_INTAKE_SECRET;
  const n8n = process.env.N8N_WEBHOOK_SECRET;
  const hdr = req.headers.get("x-lead-secret");
  const hdrN8n = req.headers.get("x-toro-secret");
  if (secret || n8n) {
    const ok =
      (secret && hdr === secret) || (n8n && hdrN8n === n8n);
    if (!ok) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  } else {
    return NextResponse.json(
      { error: "not configured — set LEAD_INTAKE_SECRET" },
      { status: 503 },
    );
  }

  const body = (await req.json().catch(() => null)) as {
    stage?: string;
    stepId?: string;
    firstName?: string;
    email?: string;
    phone?: string;
    lang?: "en" | "es";
    consentSms?: boolean;
    consentEmail?: boolean;
  } | null;

  if (!body?.stage || !body.stepId || !body.firstName) {
    return NextResponse.json(
      { error: "stage + stepId + firstName required" },
      { status: 400 },
    );
  }

  const results = await runDelayedStageStep({
    stage: body.stage as StageKey,
    stepId: body.stepId,
    firstName: body.firstName,
    email: body.email,
    phone: body.phone,
    lang: body.lang,
    consentSms: body.consentSms,
    consentEmail: body.consentEmail,
  });

  return NextResponse.json({
    ok: results.some((r) => r.ok),
    stage: body.stage,
    stepId: body.stepId,
    results,
  });
}
