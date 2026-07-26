import { NextResponse } from "next/server";
import {
  STAGE_SMS_PLANS,
  buildStageStepCopy,
  stageSmsPlanSummary,
} from "@/lib/crm/stage-sms-plan";

/**
 * GET — public-ish plan for ops (optional secret).
 * Returns SMS counts and delays per HubSpot stage.
 * ?preview=1 includes sample SMS copy (for deploy verification).
 */
export async function GET(req: Request) {
  const preview = new URL(req.url).searchParams.get("preview") === "1";
  return NextResponse.json({
    reviewUrl:
      process.env.GOOGLE_REVIEW_URL ||
      "https://g.page/r/CYAKurQHh5TvEAI/review",
    summary: stageSmsPlanSummary(),
    plans: STAGE_SMS_PLANS.map((p) => ({
      stage: p.stage,
      label: p.label,
      smsCount: p.smsCount,
      steps: p.steps.map((s) => ({
        id: s.id,
        delayMinutes: s.delayMinutes,
        delayHuman:
          s.delayMinutes === 0
            ? "instant"
            : s.delayMinutes < 60
              ? `${s.delayMinutes}m`
              : `${s.delayMinutes / 60}h`,
        channel: s.channel,
        ...(preview
          ? {
              smsPreview: buildStageStepCopy(s.id, { firstName: "ALICIA" })
                .sms,
            }
          : {}),
      })),
    })),
  });
}
