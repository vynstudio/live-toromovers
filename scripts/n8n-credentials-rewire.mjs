// Securely wires the drip: creates encrypted n8n credentials (httpHeaderAuth)
// for Resend + OpenPhone, then rewires the two funnel workflows' HTTP nodes to
// use those credentials instead of {{$env.X}} — so NO env-access flag is needed
// and no secrets live in the workflow JSON.
//
//   node scripts/n8n-credentials-rewire.mjs
//
// Reads creds from .env.wire (gitignored). The OpenPhone key is read from an
// existing working workflow so we reuse the user's already-configured key.

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const env = {};
for (const line of readFileSync(resolve(root, ".env.wire"), "utf8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2];
}
const BASE = env.N8N_BASE_URL.replace(/\/$/, "");
const H = { "X-N8N-API-KEY": env.N8N_API_KEY, "Content-Type": "application/json" };
const api = async (path, opts = {}) => {
  const r = await fetch(`${BASE}/api/v1${path}`, { headers: H, ...opts });
  const t = await r.text(); let j = null; try { j = JSON.parse(t); } catch {}
  return { status: r.status, json: j, text: t };
};

const WF = {
  funnel: { id: "Mp92yin8n2tpI0lR", file: "docs/n8n-funnel.workflow.json" },
  checklist: { id: "B20M4YQKUTI34JoJ", file: "docs/n8n-checklist-funnel.workflow.json" },
};

// OpenPhone key reused from the user's existing working workflow.
const existing = JSON.parse(readFileSync("/tmp/w-F0aLOR067HHn2oLe.json", "utf8"));
const OP_KEY = existing.nodes.find((n) => n.name === "Send SMS via Quo")
  .parameters.headerParameters.parameters.find((p) => p.name === "Authorization").value;

// 1) create encrypted credentials
async function makeCred(name, headerValue) {
  const r = await api("/credentials", {
    method: "POST",
    body: JSON.stringify({
      name, type: "httpHeaderAuth",
      data: { name: "Authorization", value: headerValue, allowedHttpRequestDomains: "all" },
    }),
  });
  if (r.status >= 300) throw new Error(`cred "${name}" failed ${r.status}: ${r.text.slice(0, 200)}`);
  console.log(`✓ credential created: ${name} (id ${r.json.id})`);
  return r.json.id;
}
const resendCredId = await makeCred("Resend (Toro funnels)", `Bearer ${env.RESEND_API_KEY}`);
const openphoneCredId = await makeCred("OpenPhone Quo (Toro funnels)", OP_KEY);

// 2) rewire nodes
function rewire(wf) {
  for (const n of wf.nodes) {
    if (n.type !== "n8n-nodes-base.httpRequest") continue;
    const url = n.parameters?.url || "";
    let credId, credName;
    if (/api\.resend\.com/.test(url)) { credId = resendCredId; credName = "Resend (Toro funnels)"; }
    else if (/api\.openphone\.com/.test(url)) { credId = openphoneCredId; credName = "OpenPhone Quo (Toro funnels)"; }
    else continue;

    n.parameters.authentication = "genericCredentialType";
    n.parameters.genericAuthType = "httpHeaderAuth";
    n.credentials = { httpHeaderAuth: { id: credId, name: credName } };
    // drop the manual Authorization header (now injected by the credential)
    if (n.parameters.headerParameters?.parameters) {
      n.parameters.headerParameters.parameters =
        n.parameters.headerParameters.parameters.filter((p) => p.name.toLowerCase() !== "authorization");
    }
  }
  return {
    name: wf.name,
    nodes: wf.nodes.map(({ webhookId, ...rest }) => rest),
    connections: wf.connections,
    settings: wf.settings || {},
  };
}

// 3) update + reactivate each workflow
for (const [key, { id, file }] of Object.entries(WF)) {
  const raw = JSON.parse(readFileSync(resolve(root, file), "utf8"));
  const body = rewire(raw);
  const u = await api(`/workflows/${id}`, { method: "PUT", body: JSON.stringify(body) });
  const upd = u.status < 300 ? "updated" : `FAILED ${u.status}: ${u.text.slice(0, 200)}`;
  let act = "?";
  if (u.status < 300) {
    const a = await api(`/workflows/${id}/activate`, { method: "POST" });
    act = a.status < 300 ? "ACTIVE" : `activate FAILED ${a.status}: ${a.text.slice(0, 160)}`;
  }
  console.log(`• ${body.name}\n  ${upd} · ${act}`);
}
console.log("\nDone — drip now uses encrypted credentials, no $env, no security flag.");
