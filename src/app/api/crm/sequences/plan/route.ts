import { NextResponse } from "next/server";

/** Stage SMS plan retired with HubSpot/n8n automation. */
export async function GET() {
  return NextResponse.json(
    {
      retired: true,
      reason: "hubspot_and_n8n_removed",
      clientSms: "single quote-received confirmation via Quo only",
    },
    { status: 410 },
  );
}
