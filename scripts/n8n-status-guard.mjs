// Inserts a HubSpot "status guard" before every drip send in both workflows:
//   Wait → [HubSpot lookup] → [IF active?] → Send   (IF-false = stop)
// so a lead marked Won (lifecyclestage=customer) / Lost-or-Unqualified
// (hs_lead_status=UNQUALIFIED) stops receiving the sequence.
//
// Idempotent-ish: skips a send that already has a guard in front of it.
// Works on the LIVE workflow (preserves the encrypted Resend/OpenPhone creds).
//
//   N8N_API_KEY=... node scripts/n8n-status-guard.mjs

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const env = {};
try {
  for (const l of readFileSync(resolve(root, ".env.wire"), "utf8").split("\n")) {
    const m = l.match(/^([A-Z0-9_]+)=(.*)$/); if (m) env[m[1]] = m[2];
  }
} catch {}
const BASE = (process.env.N8N_BASE_URL || env.N8N_BASE_URL).replace(/\/$/, "");
const KEY = process.env.N8N_API_KEY || env.N8N_API_KEY;
const HUB = env.HUBSPOT_TOKEN;
const H = { "X-N8N-API-KEY": KEY, "Content-Type": "application/json" };
const api = async (p, o = {}) => {
  const r = await fetch(`${BASE}/api/v1${p}`, { headers: H, ...o });
  const t = await r.text(); let j = null; try { j = JSON.parse(t); } catch {}
  return { status: r.status, json: j, text: t };
};

// 1) HubSpot credential (reuse if already created by a previous run)
async function hubspotCred() {
  const r = await api("/credentials", {
    method: "POST",
    body: JSON.stringify({
      name: "HubSpot (Toro guard)", type: "httpHeaderAuth",
      data: { name: "Authorization", value: `Bearer ${HUB}`, allowedHttpRequestDomains: "all" },
    }),
  });
  if (r.status < 300) { console.log(`✓ HubSpot credential created (id ${r.json.id})`); return r.json.id; }
  throw new Error(`HubSpot cred failed ${r.status}: ${r.text.slice(0, 160)}`);
}

const WF = ["Mp92yin8n2tpI0lR", "B20M4YQKUTI34JoJ"];

function lookupNode(name, pos, credId) {
  return {
    parameters: {
      method: "POST", url: "https://api.hubapi.com/crm/v3/objects/contacts/search",
      authentication: "genericCredentialType", genericAuthType: "httpHeaderAuth",
      sendBody: true, specifyBody: "json",
      jsonBody: "={\n  \"filterGroups\": [{ \"filters\": [{ \"propertyName\": \"email\", \"operator\": \"EQ\", \"value\": \"{{ $('Webhook').item.json.body.email }}\" }] }],\n  \"properties\": [\"hs_lead_status\", \"lifecyclestage\"],\n  \"limit\": 1\n}",
      options: {},
    },
    name, type: "n8n-nodes-base.httpRequest", typeVersion: 4.2, position: pos,
    credentials: { httpHeaderAuth: { id: credId, name: "HubSpot (Toro guard)" } },
    continueOnFail: true, // a HubSpot hiccup must not strand the lead — fall through to send
  };
}
function ifNode(name, pos) {
  const lc = "={{ ($json.results && $json.results[0] ? $json.results[0].properties.lifecyclestage : '') }}";
  const ls = "={{ ($json.results && $json.results[0] ? $json.results[0].properties.hs_lead_status : '') }}";
  return {
    parameters: {
      conditions: {
        options: { caseSensitive: true, version: 2 }, combinator: "and",
        conditions: [
          { leftValue: lc, rightValue: "customer", operator: { type: "string", operation: "notEquals" } },
          { leftValue: ls, rightValue: "UNQUALIFIED", operator: { type: "string", operation: "notEquals" } },
        ],
      },
      options: {},
    },
    name, type: "n8n-nodes-base.if", typeVersion: 2, position: pos,
  };
}

async function guard(id, credId) {
  const wf = (await api(`/workflows/${id}`)).json;
  const sends = wf.nodes.filter((n) => n.type === "n8n-nodes-base.httpRequest" && /resend|openphone/.test(n.parameters.url || ""));
  let added = 0;

  for (const S of sends) {
    // find the single predecessor P that feeds S
    let P = null, slot = null;
    for (const src of Object.keys(wf.connections)) {
      (wf.connections[src].main || []).forEach((arr, oi) => {
        (arr || []).forEach((c) => { if (c.node === S.name) { P = src; slot = oi; } });
      });
    }
    if (!P) continue;
    if (/^Guard if · /.test(P)) continue; // already guarded

    const lkName = `Guard lookup · ${S.name}`.slice(0, 60);
    const ifName = `Guard if · ${S.name}`.slice(0, 60);
    const base = S.position || [0, 0];
    wf.nodes.push(lookupNode(lkName, [base[0] - 360, base[1] + 140], credId));
    wf.nodes.push(ifNode(ifName, [base[0] - 180, base[1] + 140]));

    // rewire: P(slot) → lookup → if; if.true → S  (if.false = dead end / stop)
    wf.connections[P].main[slot] = wf.connections[P].main[slot].map((c) => (c.node === S.name ? { ...c, node: lkName } : c));
    wf.connections[lkName] = { main: [[{ node: ifName, type: "main", index: 0 }]] };
    wf.connections[ifName] = { main: [[{ node: S.name, type: "main", index: 0 }], []] };
    added++;
  }

  // integrity check
  const names = new Set(wf.nodes.map((n) => n.name));
  for (const [src, v] of Object.entries(wf.connections)) {
    if (!names.has(src)) throw new Error(`orphan source ${src} in ${wf.name}`);
    for (const arr of v.main || []) for (const c of arr || []) if (!names.has(c.node)) throw new Error(`bad target ${c.node} in ${wf.name}`);
  }

  const body = { name: wf.name, nodes: wf.nodes.map(({ webhookId, ...r }) => r), connections: wf.connections, settings: wf.settings || {} };
  const u = await api(`/workflows/${id}`, { method: "PUT", body: JSON.stringify(body) });
  if (u.status >= 300) throw new Error(`PUT ${id} failed ${u.status}: ${u.text.slice(0, 200)}`);
  await api(`/workflows/${id}/deactivate`, { method: "POST" });
  const a = await api(`/workflows/${id}/activate`, { method: "POST" });
  console.log(`• ${wf.name}: +${added} guards · ${a.status < 300 ? "reactivated ✅" : "activate FAILED " + a.status}`);
}

const credId = await hubspotCred();
for (const id of WF) await guard(id, credId);
console.log("\nStatus guard installed on both drips.");
