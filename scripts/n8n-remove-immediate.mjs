// Removes the "(immediate)" Email 1 + SMS 1 nodes from the funnel + checklist
// workflows so n8n only handles follow-up from day 2+ (the site already sends
// the instant confirmation). Reconnects each removed node's predecessor straight
// to its Wait successor, so the downstream timing (day 2 / day 3 / day 5 …) is
// preserved.
//
//   node scripts/n8n-remove-immediate.mjs            # LOCAL: rewrite docs/*.json
//   N8N_API_KEY=... node scripts/n8n-remove-immediate.mjs --live   # also apply to live n8n (preserves credentials)

import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const LIVE = process.argv.includes("--live");

const TARGETS = {
  "docs/n8n-funnel.workflow.json": {
    id: "Mp92yin8n2tpI0lR",
    remove: ["Labor Email 1 (immediate)", "Labor SMS 1 (immediate)", "Full Email 1 (immediate)", "Full SMS 1 (immediate)"],
  },
  "docs/n8n-checklist-funnel.workflow.json": {
    id: "B20M4YQKUTI34JoJ",
    remove: ["Email 1 — Checklist (immediate)", "SMS 1 — Checklist (immediate)"],
  },
};

// Rewire: anything pointing at `name` now points at name's single successor;
// then drop the node + its outgoing connections.
function removeImmediate(wf, name) {
  const out = wf.connections[name]?.main?.[0]?.[0]?.node; // the Wait node after it
  for (const src of Object.keys(wf.connections)) {
    const outputs = wf.connections[src].main || [];
    for (const arr of outputs) {
      if (!Array.isArray(arr)) continue;
      for (const c of arr) if (c.node === name) c.node = out;
    }
  }
  delete wf.connections[name];
  wf.nodes = wf.nodes.filter((n) => n.name !== name);
}

function scheduleOf(wf) {
  // best-effort: list remaining send nodes in connection order with their wait offset
  return wf.nodes
    .filter((n) => n.type === "n8n-nodes-base.httpRequest")
    .map((n) => (/resend/.test(n.parameters.url) ? "EMAIL " : "SMS   ") + n.name);
}

async function apply(file, cfg) {
  // LOCAL source of truth = the docs JSON (kept as importable template)
  const wf = JSON.parse(readFileSync(resolve(root, file), "utf8"));
  cfg.remove.forEach((n) => removeImmediate(wf, n));
  writeFileSync(resolve(root, file), JSON.stringify(wf, null, 2) + "\n");
  console.log(`\n${file} — now ${wf.nodes.filter((n) => n.type === "n8n-nodes-base.httpRequest").length} sends:`);
  scheduleOf(wf).forEach((s) => console.log("  " + s));

  if (!LIVE) return;
  // LIVE: pull the CURRENT workflow from n8n (it carries the encrypted
  // credentials we wired earlier), strip immediate nodes there too, PUT back.
  const BASE = (process.env.N8N_BASE_URL || "https://n8n-production-d3d0.up.railway.app").replace(/\/$/, "");
  const KEY = process.env.N8N_API_KEY;
  if (!KEY) throw new Error("N8N_API_KEY env required for --live");
  const H = { "X-N8N-API-KEY": KEY, "Content-Type": "application/json" };
  const cur = await (await fetch(`${BASE}/api/v1/workflows/${cfg.id}`, { headers: H })).json();
  cfg.remove.forEach((n) => removeImmediate(cur, n));
  const body = {
    name: cur.name,
    nodes: cur.nodes.map(({ webhookId, ...rest }) => rest),
    connections: cur.connections,
    settings: cur.settings || {},
  };
  const u = await fetch(`${BASE}/api/v1/workflows/${cfg.id}`, { method: "PUT", headers: H, body: JSON.stringify(body) });
  if (!u.ok) throw new Error(`PUT ${cfg.id} failed ${u.status}: ${(await u.text()).slice(0, 200)}`);
  // force webhook re-registration
  await fetch(`${BASE}/api/v1/workflows/${cfg.id}/deactivate`, { method: "POST", headers: H });
  const a = await fetch(`${BASE}/api/v1/workflows/${cfg.id}/activate`, { method: "POST", headers: H });
  console.log(`  LIVE → updated + ${a.ok ? "reactivated ✅" : "activate FAILED " + a.status}`);
}

for (const [file, cfg] of Object.entries(TARGETS)) await apply(file, cfg);
console.log("\nDone.");
