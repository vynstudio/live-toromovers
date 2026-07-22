import { NextResponse } from "next/server";
import { advanceStage, STAGE_SHORT } from "@/lib/crm/stage";
import type { StageKey } from "@/lib/crm/types";

/**
 * Advance a deal stage.
 *
 * GET  — Telegram URL buttons: ?e=email&s=c  (or phone=)
 * POST — JSON { email?, phone?, stage, notifyTelegram? }
 *
 * Auth: x-lead-secret === LEAD_INTAKE_SECRET (optional if GET from Telegram
 * open links — those are unguessable enough with email; still prefer secret
 * for POST).
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const email = url.searchParams.get("e") || url.searchParams.get("email") || undefined;
  const phone = url.searchParams.get("p") || url.searchParams.get("phone") || undefined;
  const s = url.searchParams.get("s") || url.searchParams.get("stage") || "";
  if ((!email && !phone) || !s) {
    return new NextResponse("missing e/p or s", { status: 400 });
  }
  const result = await advanceStage({
    email,
    phone,
    stage: s,
    notifyTelegram: true,
    label: STAGE_SHORT[s] || s,
  });
  // Tiny HTML so Telegram in-app browser shows feedback
  const msg = result.ok
    ? `✅ Stage updated → ${result.stage}`
    : `❌ ${result.error || "failed"}`;
  return new NextResponse(
    `<!doctype html><meta name=viewport content="width=device-width,initial-scale=1"><body style="font:16px system-ui;padding:24px">${msg}</body>`,
    { headers: { "Content-Type": "text/html; charset=utf-8" } },
  );
}

export async function POST(req: Request) {
  const secret = process.env.LEAD_INTAKE_SECRET;
  if (secret && req.headers.get("x-lead-secret") !== secret) {
    // Allow if n8n shares N8N_WEBHOOK_SECRET
    const n8n = process.env.N8N_WEBHOOK_SECRET;
    if (!n8n || req.headers.get("x-toro-secret") !== n8n) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const body = (await req.json().catch(() => null)) as {
    email?: string;
    phone?: string;
    stage?: string;
    notifyTelegram?: boolean;
  } | null;
  if (!body?.stage || (!body.email && !body.phone)) {
    return NextResponse.json(
      { error: "stage + (email or phone) required" },
      { status: 400 },
    );
  }

  const result = await advanceStage({
    email: body.email,
    phone: body.phone,
    stage: body.stage as StageKey,
    notifyTelegram: body.notifyTelegram !== false,
  });

  return NextResponse.json(result, { status: result.ok ? 200 : 404 });
}
