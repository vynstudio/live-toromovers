// Sets the n8n webhook env vars on the Netlify site and triggers a deploy.
// Reads creds + values from .env.wire (gitignored). Idempotent: updates existing
// keys, creates missing ones.
//   node scripts/wire-netlify.mjs

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const env = {};
for (const line of readFileSync(resolve(root, ".env.wire"), "utf8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2];
}

const TOKEN = env.NETLIFY_TOKEN;
const SITE = env.NETLIFY_SITE_ID;
const API = "https://api.netlify.com/api/v1";
const H = { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" };

const VARS = {
  N8N_FUNNEL_WEBHOOK_URL: env.N8N_FUNNEL_WEBHOOK_URL,
  N8N_LEAD_WEBHOOK_URL: env.N8N_LEAD_WEBHOOK_URL,
  N8N_WEBHOOK_SECRET: env.N8N_WEBHOOK_SECRET,
};
const SCOPES = ["builds", "functions", "runtime", "post_processing"];

const j = async (url, opts = {}) => {
  const r = await fetch(url, { headers: H, ...opts });
  const t = await r.text();
  let json = null; try { json = JSON.parse(t); } catch {}
  return { status: r.status, json, text: t };
};

const site = (await j(`${API}/sites/${SITE}`)).json;
const acct = site.account_slug;
console.log(`Site: ${site.name} (${site.custom_domain}) · account ${acct}\n`);

const existing = (await j(`${API}/accounts/${acct}/env?site_id=${SITE}`)).json || [];
const has = new Set(existing.map((v) => v.key));

for (const [key, value] of Object.entries(VARS)) {
  if (has.has(key)) {
    const r = await j(`${API}/accounts/${acct}/env/${key}?site_id=${SITE}`, {
      method: "PATCH",
      body: JSON.stringify({ context: "all", value }),
    });
    console.log(`${r.status < 300 ? "✓ updated" : "✗ FAILED " + r.status}  ${key}`);
    if (r.status >= 300) console.log("   ", r.text.slice(0, 160));
  } else {
    const r = await j(`${API}/accounts/${acct}/env?site_id=${SITE}`, {
      method: "POST",
      body: JSON.stringify([{ key, scopes: SCOPES, values: [{ value, context: "all" }] }]),
    });
    console.log(`${r.status < 300 ? "✓ created" : "✗ FAILED " + r.status}  ${key}`);
    if (r.status >= 300) console.log("   ", r.text.slice(0, 160));
  }
}

// trigger a fresh production deploy so the new env vars take effect
const build = await j(`${API}/sites/${SITE}/builds`, { method: "POST", body: "{}" });
console.log(`\nDeploy trigger: ${build.status < 300 ? "✓ queued (build #" + (build.json?.id || "?") + ")" : "✗ FAILED " + build.status}`);
if (build.status >= 300) console.log("  ", build.text.slice(0, 160));
