// Toro Movers — HubSpot CRM bootstrap.
//
//   HUBSPOT_TOKEN=pat-xxxx node scripts/hubspot-setup.mjs
//   # or, with the token already in the environment:
//   npm run hubspot:setup
//
// Idempotent: creates the "Toro Movers" deal pipeline (6 stages) and the four
// custom deal properties if they don't exist yet, then prints the resulting
// pipeline ID, stage IDs, and property internal names. Safe to re-run.
//
// Requires a HubSpot private-app token with these scopes:
//   crm.schemas.deals.read   crm.schemas.deals.write
//   crm.objects.deals.read   crm.objects.deals.write

const TOKEN = process.env.HUBSPOT_TOKEN;
if (!TOKEN) {
  console.error("✖ HUBSPOT_TOKEN is not set. Export your private-app token first.");
  process.exit(1);
}

const BASE = "https://api.hubapi.com";

// NOTE: This pipeline already exists in HubSpot ("Mudanzas"). The script finds
// it by label and reuses it (idempotent) — verify PIPELINE_LABEL matches the
// real name so it doesn't create a duplicate. Stages below mirror the real
// 8-stage pipeline and the slugs netlify/functions/crm-hook.ts branches on.
const PIPELINE_LABEL = "Mudanzas";

const STAGES = [
  { label: "New Lead", slug: "new_lead", probability: "0.05", isClosed: "false" },
  { label: "Contact Attempt", slug: "contact_attempt", probability: "0.1", isClosed: "false" },
  { label: "Contacted", slug: "contacted", probability: "0.2", isClosed: "false" },
  { label: "Quote Sent", slug: "quote_sent", probability: "0.4", isClosed: "false" },
  { label: "Booked / Scheduled", slug: "booked_scheduled", probability: "0.7", isClosed: "false" },
  { label: "Move Completed", slug: "move_completed", probability: "1.0", isClosed: "true" },
  { label: "Review Request Sent", slug: "review_request_sent", probability: "1.0", isClosed: "true" },
  { label: "Review Obtained", slug: "review_obtained", probability: "1.0", isClosed: "true" },
];

// Custom deal properties (internal names match the webhook payload).
const PROPERTIES = [
  { name: "last_customer_reply", label: "Last customer reply", type: "datetime", fieldType: "date" },
  { name: "quote_amount", label: "Quote amount", type: "number", fieldType: "number" },
  { name: "deposit_link", label: "Deposit link", type: "string", fieldType: "text" },
  { name: "move_date", label: "Move date", type: "date", fieldType: "date" },
];

async function hs(path, method = "GET", body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  let json = null;
  try {
    json = await res.json();
  } catch {
    /* empty body (e.g. 204) */
  }
  return { status: res.status, ok: res.ok, json };
}

function die(label, res) {
  console.error(`✖ ${label} failed (HTTP ${res.status}):`);
  console.error(JSON.stringify(res.json, null, 2));
  process.exit(1);
}

async function ensurePipeline() {
  const list = await hs("/crm/v3/pipelines/deals");
  if (!list.ok) die("List deal pipelines", list);

  const existing = list.json.results?.find((p) => p.label === PIPELINE_LABEL);
  if (existing) {
    console.log(`• Pipeline "${PIPELINE_LABEL}" already exists — reusing (id ${existing.id}).`);
    return existing;
  }

  const created = await hs("/crm/v3/pipelines/deals", "POST", {
    label: PIPELINE_LABEL,
    displayOrder: 0,
    stages: STAGES.map((s, i) => ({
      label: s.label,
      displayOrder: i,
      metadata: { isClosed: s.isClosed, probability: s.probability },
    })),
  });
  if (!created.ok) die("Create pipeline", created);
  console.log(`✓ Created pipeline "${PIPELINE_LABEL}" (id ${created.json.id}).`);
  return created.json;
}

async function ensureProperty(def) {
  const found = await hs(`/crm/v3/properties/deals/${def.name}`);
  if (found.ok) {
    console.log(`• Property "${def.name}" already exists — skipping.`);
    return;
  }
  if (found.status !== 404) die(`Check property ${def.name}`, found);

  const created = await hs("/crm/v3/properties/deals", "POST", {
    name: def.name,
    label: def.label,
    type: def.type,
    fieldType: def.fieldType,
    groupName: "dealinformation",
  });
  if (!created.ok) die(`Create property ${def.name}`, created);
  console.log(`✓ Created property "${def.name}" (${def.type}).`);
}

async function main() {
  console.log("→ Setting up HubSpot for Toro Movers…\n");

  const pipeline = await ensurePipeline();
  for (const p of PROPERTIES) await ensureProperty(p);

  console.log("\n──────── Pipeline ────────");
  console.log(`label:  ${pipeline.label}`);
  console.log(`id:     ${pipeline.id}`);
  console.log("\nStage IDs:");
  for (const s of pipeline.stages.sort((a, b) => a.displayOrder - b.displayOrder)) {
    console.log(`  ${s.label.padEnd(12)} → ${s.id}`);
  }

  console.log("\n──────── Custom deal properties (internal names) ────────");
  for (const p of PROPERTIES) console.log(`  ${p.name.padEnd(22)} (${p.type})`);

  console.log("\n✓ Done. Map the workflow's stage field to the slugs the webhook expects:");
  for (const s of STAGES) console.log(`  ${s.label.padEnd(12)} → "${s.slug}"`);
}

main().catch((err) => {
  console.error("✖ Unexpected error:", err);
  process.exit(1);
});
