// Removes retired HubSpot / n8n env keys from Netlify (if present) and
// triggers a deploy so runtime no longer sees them.
// Reads NETLIFY_TOKEN + NETLIFY_SITE_ID from .env.wire (gitignored).
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
if (!TOKEN || !SITE) {
  console.error("Need NETLIFY_TOKEN + NETLIFY_SITE_ID in .env.wire");
  process.exit(1);
}

const API = "https://api.netlify.com/api/v1";
const H = {
  Authorization: `Bearer ${TOKEN}`,
  "Content-Type": "application/json",
};

/** Keys that must not live on Netlify anymore */
const DELETE_KEYS = [
  "HUBSPOT_TOKEN",
  "HUBSPOT_HAS_FUNNEL_TYPE",
  "HUBSPOT_SYNC",
  "N8N_FUNNEL_WEBHOOK_URL",
  "N8N_LEAD_WEBHOOK_URL",
  "N8N_CRM_WEBHOOK_URL",
  "N8N_STAGE_WEBHOOK_URL",
  "N8N_WEBHOOK_SECRET",
  "N8N_BASE_URL",
  "N8N_API_KEY",
  "N8N_ENABLED",
  "FOLLOWUP_AUTOMATION",
];

const j = async (url, opts = {}) => {
  const r = await fetch(url, { headers: H, ...opts });
  const t = await r.text();
  let json = null;
  try {
    json = JSON.parse(t);
  } catch {
    /* */
  }
  return { status: r.status, json, text: t };
};

const site = (await j(`${API}/sites/${SITE}`)).json;
const acct = site.account_slug;
console.log(`Site: ${site.name} (${site.custom_domain}) · account ${acct}\n`);

const existing =
  (await j(`${API}/accounts/${acct}/env?site_id=${SITE}`)).json || [];
const byKey = new Map(existing.map((e) => [e.key, e]));

for (const key of DELETE_KEYS) {
  const row = byKey.get(key);
  if (!row) {
    console.log(`· ${key} — not set`);
    continue;
  }
  // Netlify: DELETE /accounts/{account_id}/env/{key}?site_id=
  const del = await j(
    `${API}/accounts/${acct}/env/${encodeURIComponent(key)}?site_id=${SITE}`,
    { method: "DELETE" },
  );
  console.log(
    del.status < 300
      ? `✓ deleted ${key}`
      : `✗ ${key} delete ${del.status} ${String(del.text).slice(0, 120)}`,
  );
}

// Trigger deploy so functions pick up env without the deleted keys
const deploy = await j(`${API}/sites/${SITE}/builds`, {
  method: "POST",
  body: JSON.stringify({ clear_cache: true }),
});
console.log(
  deploy.status < 300
    ? `\n✓ deploy triggered`
    : `\n✗ deploy ${deploy.status} ${String(deploy.text).slice(0, 200)}`,
);
