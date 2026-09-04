import { NextResponse } from "next/server";
import { getStore } from "@netlify/blobs";
import { randomUUID } from "crypto";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { sendEmail, sendTelegram } from "@/lib/crm/providers";
import {
  emptyPayload,
  needsReviewReasons,
  validateStep,
  type MoveChecklistPayload,
} from "@/lib/move-checklist/model";

export const runtime = "nodejs";

function store() {
  const siteID = process.env.NETLIFY_SITE_ID || process.env.SITE_ID;
  const token = process.env.NETLIFY_BLOBS_TOKEN;
  if (siteID && token) {
    return getStore({ name: "move-checklists", siteID, token, consistency: "strong" });
  }
  return getStore({ name: "move-checklists", consistency: "strong" });
}

function isPreview(): boolean {
  const ctx = (process.env.CONTEXT || "").toLowerCase();
  if (ctx === "deploy-preview" || ctx === "branch-deploy") return true;
  const url = `${process.env.DEPLOY_PRIME_URL || ""} ${process.env.URL || ""}`;
  return /--[a-z0-9-]+\.netlify\.app/i.test(url);
}

function line(label: string, value: string | undefined): string {
  const v = (value || "").trim();
  return v ? `${label}: ${v}` : "";
}

function accessBlock(title: string, a: MoveChecklistPayload["pickup"]): string {
  return [
    title,
    line("Property", a.propertyType),
    line("Floor", a.floor),
    line("Stairs", a.stairs === "Yes" ? `${a.stairs} · ${a.stairFlights}` : a.stairs),
    line(
      "Elevator",
      a.elevator === "Yes"
        ? `${a.elevator} · reserved ${a.elevatorReserved} · freight ${a.freightElevator}`
        : a.elevator,
    ),
    line("Parking", a.parking),
    line("Carry", a.carry),
    line("Restrictions", a.restrictions === "Yes" ? a.restrictionNotes : a.restrictions),
    line("COI", a.coi),
    a.coi === "Yes" || a.coi === "Not sure"
      ? line("COI manager", `${a.coiManagerName} · ${a.coiManagerEmail} · ${a.coiManagerPhone}`)
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export async function POST(req: Request) {
  const rl = await rateLimit({
    key: `mdc:${clientIp(req)}`,
    limit: 8,
    windowMs: 10 * 60 * 1000,
  });
  if (!rl.ok) {
    return NextResponse.json({ error: "Too many tries. Wait a few minutes." }, { status: 429 });
  }

  const raw = (await req.json().catch(() => null)) as Partial<MoveChecklistPayload> | null;
  if (!raw || typeof raw !== "object") {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const base = emptyPayload();
  const data: MoveChecklistPayload = {
    ...base,
    ...raw,
    pickup: { ...base.pickup, ...(raw.pickup || {}) },
    delivery: { ...base.delivery, ...(raw.delivery || {}) },
    acks: { ...base.acks, ...(raw.acks || {}) },
    changes: Array.isArray(raw.changes) ? raw.changes : [],
    specialtyItems: Array.isArray(raw.specialtyItems) ? raw.specialtyItems : [],
    services: Array.isArray(raw.services) ? raw.services : [],
  };
  if (data.hp?.trim() || (typeof data.elapsedMs === "number" && data.elapsedMs < 2500)) {
    return NextResponse.json({ error: "Please try again." }, { status: 400 });
  }

  for (const step of [1, 2, 3, 4] as const) {
    const err = validateStep(step, data);
    if (err) return NextResponse.json({ error: err }, { status: 400 });
  }

  const flags = needsReviewReasons(data);
  const needsReview = flags.length > 0;
  const id = randomUUID();
  const submittedAt = new Date().toISOString();
  const record = {
    id,
    submittedAt,
    needsReview,
    flags,
    preview: isPreview(),
    status: needsReview ? "needs_review" : "ready_for_staff",
    // Never auto-send booking confirmation.
    bookingConfirmation: "manual_only",
    payload: data,
  };

  try {
    await store().setJSON(`submissions/${id}`, record);
  } catch (err) {
    console.error("[move-checklist] blob", err);
    return NextResponse.json(
      { error: "Could not save. Please try again in a moment." },
      { status: 503 },
    );
  }

  const previewTag = isPreview() ? "🧪 PREVIEW · " : "";
  const flagLine = needsReview ? `🚩 NEEDS REVIEW\n${flags.map((f) => `• ${f}`).join("\n")}` : "✅ No auto-flags";
  const text = [
    `${previewTag}📋 MOVE CHECKLIST — do not auto-confirm`,
    flagLine,
    "",
    line("Name", data.fullName),
    line("Phone", data.phone),
    line("Email", data.email),
    line("Move date", data.moveDate),
    line("Pickup", `${data.pickupAddress}${data.pickupUnit ? ` · ${data.pickupUnit}` : ""}`),
    line("Delivery", `${data.deliveryAddress}${data.deliveryUnit ? ` · ${data.deliveryUnit}` : ""}`),
    line("Present pickup", data.presentPickup),
    data.presentPickup === "No"
      ? line("Pickup contact", `${data.pickupContactName} ${data.pickupContactPhone}`)
      : "",
    line("Present delivery", data.presentDelivery),
    data.presentDelivery === "No"
      ? line("Delivery contact", `${data.deliveryContactName} ${data.deliveryContactPhone}`)
      : "",
    data.additionalStop === "Yes"
      ? line("Extra stop", `${data.extraStopKind} · ${data.extraStopAddress}`)
      : "Additional stop: No",
    "",
    accessBlock("PICKUP ACCESS", data.pickup),
    "",
    accessBlock("DELIVERY ACCESS", data.delivery),
    "",
    line("Changes", data.changes.join(", ")),
    data.changeNotes ? line("Change notes", data.changeNotes) : "",
    line("Specialty", data.specialtyItems.join(", ") || "None"),
    data.specialtyDescription ? line("Specialty notes", data.specialtyDescription) : "",
    line("Packing", data.packingReady),
    line("Services", data.services.join(", ") || "None"),
    line("Signed", data.typedName),
    line("Submitted", submittedAt),
    `ID: ${id}`,
  ]
    .filter(Boolean)
    .join("\n")
    .slice(0, 3900);

  const tg = await sendTelegram(text);
  const emailHtml = `<pre style="font-family:ui-monospace,monospace;font-size:13px;white-space:pre-wrap">${text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")}</pre>`;
  const em = await sendEmail({
    to:
      process.env.LEAD_NOTIFICATION_EMAIL ||
      process.env.BOOKING_NOTIFICATION_EMAIL ||
      process.env.RESEND_FROM_EMAIL ||
      "hello@toromovers.net",
    subject: `${previewTag}${needsReview ? "🚩 " : ""}Move checklist · ${data.fullName}`,
    html: emailHtml,
    text,
    fromName: "Toro Movers Checklist",
  });

  console.log("[move-checklist]", id, { needsReview, telegram: tg.ok, email: em.ok });

  return NextResponse.json({
    ok: true,
    id,
    needsReview,
    // Explicit: staff sends booking confirmation after review.
    confirmation: "pending_staff_review",
  });
}
