import { NextResponse } from "next/server";

/** n8n sequence automation removed permanently. */
export async function POST() {
  return NextResponse.json(
    { ok: false, disabled: true, reason: "n8n_and_hubspot_removed" },
    { status: 410 },
  );
}
