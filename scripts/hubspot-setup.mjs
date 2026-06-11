// Creates the custom contact properties + the "Mudanzas" deal pipeline in
// HubSpot. Idempotent: skips anything that already exists. Reads HUBSPOT_TOKEN
// from .env.wire (gitignored). Prints the pipeline + stage IDs to wire into the
// site.
//   node scripts/hubspot-setup.mjs

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const env = {};
for (const line of readFileSync(resolve(root, ".env.wire"), "utf8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/); if (m) env[m[1]] = m[2];
}
const H = { Authorization: `Bearer ${env.HUBSPOT_TOKEN}`, "Content-Type": "application/json" };
const api = async (path, opts = {}) => {
  const r = await fetch(`https://api.hubapi.com${path}`, { headers: H, ...opts });
  const t = await r.text(); let j = null; try { j = JSON.parse(t); } catch {}
  return { status: r.status, json: j, text: t };
};

/* ---------- 1. custom contact properties ---------- */
const PROPS = [
  { name: "funnel_type", label: "Funnel Type", type: "enumeration", fieldType: "select",
    options: ["labor", "full-service", "checklist"].map((v, i) => ({ label: v, value: v, displayOrder: i })) },
  { name: "service_type", label: "Service Type", type: "string", fieldType: "text" },
  { name: "move_date", label: "Move Date", type: "string", fieldType: "text" },
  { name: "utm_source", label: "UTM Source", type: "string", fieldType: "text" },
  { name: "utm_medium", label: "UTM Medium", type: "string", fieldType: "text" },
  { name: "utm_campaign", label: "UTM Campaign", type: "string", fieldType: "text" },
  { name: "utm_content", label: "UTM Content", type: "string", fieldType: "text" },
];

console.log("— custom contact properties —");
for (const p of PROPS) {
  const exists = await api(`/crm/v3/properties/contacts/${p.name}`);
  if (exists.status === 200) { console.log(`  • ${p.name} → already exists, skip`); continue; }
  const r = await api(`/crm/v3/properties/contacts`, {
    method: "POST",
    body: JSON.stringify({ ...p, groupName: "contactinformation" }),
  });
  console.log(`  • ${p.name} → ${r.status < 300 ? "created ✅" : "FAILED " + r.status + " " + r.text.slice(0, 140)}`);
}

/* ---------- 2. deal pipeline "Mudanzas" ---------- */
const STAGES = [
  { label: "New Lead", probability: "0.1" },
  { label: "Contacted", probability: "0.2" },
  { label: "Quote Sent", probability: "0.4" },
  { label: "Booked / Scheduled", probability: "0.6" },
  { label: "Move Completed", probability: "0.9" },
  { label: "Won", probability: "1.0", isClosed: "true" },
  { label: "Lost", probability: "0.0", isClosed: "true" },
];

console.log("\n— deal pipeline —");
const pls = await api(`/crm/v3/pipelines/deals`);
let pipeline = (pls.json?.results || []).find((p) => p.label === "Mudanzas");
if (pipeline) {
  console.log(`  pipeline "Mudanzas" already exists (id ${pipeline.id})`);
} else {
  const r = await api(`/crm/v3/pipelines/deals`, {
    method: "POST",
    body: JSON.stringify({
      label: "Mudanzas", displayOrder: 1,
      stages: STAGES.map((s, i) => ({
        label: s.label, displayOrder: i,
        metadata: { probability: s.probability, ...(s.isClosed ? { isClosed: s.isClosed } : {}) },
      })),
    }),
  });
  if (r.status >= 300) { console.log(`  pipeline FAILED ${r.status}: ${r.text.slice(0, 220)}`); process.exit(1); }
  pipeline = r.json;
  console.log(`  pipeline "Mudanzas" created ✅ (id ${pipeline.id})`);
}

console.log("\n— IDs to wire into the site (lib/hubspot-pipeline.ts) —");
console.log(`  PIPELINE_ID = "${pipeline.id}"`);
for (const s of pipeline.stages.sort((a, b) => a.displayOrder - b.displayOrder)) {
  console.log(`  ${s.label.padEnd(20)} → "${s.id}"`);
}
