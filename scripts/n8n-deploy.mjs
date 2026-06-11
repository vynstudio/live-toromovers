// Imports + activates the two funnel workflows into n8n via the public API.
// Idempotent: if a workflow with the same name exists, it updates it instead of
// duplicating. Reads creds from .env.wire (gitignored).
//
//   node scripts/n8n-deploy.mjs
//
// Prints the production webhook URLs to wire into Netlify.

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

// load .env.wire
const env = {};
for (const line of readFileSync(resolve(root, ".env.wire"), "utf8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2];
}
const BASE = env.N8N_BASE_URL.replace(/\/$/, "");
const KEY = env.N8N_API_KEY;
const H = { "X-N8N-API-KEY": KEY, "Content-Type": "application/json" };

const FILES = [
  "docs/n8n-funnel.workflow.json",
  "docs/n8n-checklist-funnel.workflow.json",
];

// Only these top-level fields are accepted by POST/PUT /workflows.
function clean(raw) {
  const wf = JSON.parse(raw);
  return {
    name: wf.name,
    nodes: wf.nodes.map((n) => {
      const { webhookId, ...rest } = n; // let n8n assign fresh webhookIds; path drives the URL
      return rest;
    }),
    connections: wf.connections,
    settings: wf.settings || {},
  };
}

function webhookPath(wf) {
  const hook = wf.nodes.find((n) => n.type === "n8n-nodes-base.webhook");
  return hook?.parameters?.path;
}

const api = async (path, opts = {}) => {
  const res = await fetch(`${BASE}/api/v1${path}`, { headers: H, ...opts });
  const text = await res.text();
  let json = null; try { json = JSON.parse(text); } catch {}
  return { status: res.status, json, text };
};

const existing = (await api("/workflows?limit=250")).json?.data || [];

for (const file of FILES) {
  const wf = clean(readFileSync(resolve(root, file), "utf8"));
  const path = webhookPath(wf);
  const match = existing.find((w) => w.name === wf.name);

  let id, action;
  if (match) {
    const r = await api(`/workflows/${match.id}`, { method: "PUT", body: JSON.stringify(wf) });
    id = match.id; action = r.status < 300 ? "updated" : `update FAILED ${r.status}: ${r.text.slice(0,200)}`;
  } else {
    const r = await api(`/workflows`, { method: "POST", body: JSON.stringify(wf) });
    id = r.json?.id; action = r.status < 300 ? "created" : `create FAILED ${r.status}: ${r.text.slice(0,200)}`;
  }

  let activeState = "?";
  if (id && !action.includes("FAILED")) {
    const a = await api(`/workflows/${id}/activate`, { method: "POST" });
    activeState = a.status < 300 ? "ACTIVE" : `activate FAILED ${a.status}: ${a.text.slice(0,160)}`;
  }

  console.log(`\n• ${wf.name}`);
  console.log(`  ${action} · ${activeState}`);
  if (path) console.log(`  WEBHOOK → ${BASE}/webhook/${path}`);
}
