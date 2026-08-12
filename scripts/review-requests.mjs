#!/usr/bin/env node
/**
 * Batch Google-review requests to past customers.
 *
 * Reads a CSV of people who have ALREADY hired Toro and fires each one through
 * /api/review-request (SMS via OpenPhone, email via Resend, whichever the row
 * has). Google reviews are the strongest free local-pack lever, and this turns
 * "remember to ask" into one command.
 *
 * DRY RUN BY DEFAULT. Nothing is sent unless you pass --send.
 *
 *   node scripts/review-requests.mjs customers.csv            # preview only
 *   node scripts/review-requests.mjs customers.csv --send      # actually sends
 *   node scripts/review-requests.mjs customers.csv --send --limit 25
 *
 * CSV columns (header row required, order free, extra columns ignored):
 *   name,phone,email,lang
 * `name` plus at least one of phone/email is required. lang = en|es (default en).
 *
 * Auth: LEAD_INTAKE_SECRET must be set. Pull it from Netlify without printing:
 *   export LEAD_INTAKE_SECRET=$(npx netlify env:get LEAD_INTAKE_SECRET)
 *
 * Sent rows are appended to scripts/.review-sent.log and skipped on re-runs, so
 * a rerun after a crash will not double-text anyone.
 */

import { readFileSync, appendFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const SENT_LOG = join(HERE, ".review-sent.log");
const ENDPOINT =
  process.env.REVIEW_ENDPOINT || "https://toromovers.com/api/review-request";
const SECRET = process.env.LEAD_INTAKE_SECRET;

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith("--"));
const SEND = args.includes("--send");
const limitArg = args.indexOf("--limit");
const LIMIT = limitArg !== -1 ? Number(args[limitArg + 1]) : Infinity;
/** Carriers flag bursts. One message every few seconds looks human. */
const DELAY_MS = Number(process.env.REVIEW_DELAY_MS || 3000);

if (!file) {
  console.error("usage: node scripts/review-requests.mjs <customers.csv> [--send] [--limit N]");
  process.exit(2);
}
if (SEND && !SECRET) {
  console.error(
    "LEAD_INTAKE_SECRET missing.\n" +
      "  export LEAD_INTAKE_SECRET=$(npx netlify env:get LEAD_INTAKE_SECRET)",
  );
  process.exit(2);
}

/** Minimal CSV reader: handles quoted fields and embedded commas. */
function parseCsv(text) {
  const rows = [];
  let row = [], cell = "", inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') inQ = false;
      else cell += c;
    } else if (c === '"') inQ = true;
    else if (c === ",") { row.push(cell); cell = ""; }
    else if (c === "\n") { row.push(cell); rows.push(row); row = []; cell = ""; }
    else if (c !== "\r") cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((r) => r.some((v) => v.trim() !== ""));
}

const digits = (v) => String(v || "").replace(/\D/g, "");
const validPhone = (v) => { const d = digits(v); return d.length === 10 || (d.length === 11 && d[0] === "1"); };
const validEmail = (v) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(v || "").trim());

const rows = parseCsv(readFileSync(file, "utf8"));
const header = rows.shift().map((h) => h.trim().toLowerCase());
const col = (r, k) => { const i = header.indexOf(k); return i === -1 ? "" : (r[i] || "").trim(); };

const alreadySent = new Set(
  existsSync(SENT_LOG)
    ? readFileSync(SENT_LOG, "utf8").split("\n").map((l) => l.split("\t")[1]).filter(Boolean)
    : [],
);

const queue = [];
const skipped = [];
const seen = new Set();

for (const r of rows) {
  const name = col(r, "name");
  const phone = col(r, "phone");
  const email = col(r, "email");
  const lang = (col(r, "lang") || "en").toLowerCase() === "es" ? "es" : "en";
  const key = validPhone(phone) ? "+1" + digits(phone).slice(-10) : email.toLowerCase();

  if (!name) { skipped.push([name || "(no name)", "missing name"]); continue; }
  if (!validPhone(phone) && !validEmail(email)) { skipped.push([name, "no usable phone or email"]); continue; }
  if (seen.has(key)) { skipped.push([name, "duplicate in file"]); continue; }
  if (alreadySent.has(key)) { skipped.push([name, "already sent previously"]); continue; }

  seen.add(key);
  queue.push({
    name,
    key,
    lang,
    ...(validPhone(phone) ? { phone } : {}),
    ...(validEmail(email) ? { email } : {}),
  });
}

const batch = queue.slice(0, LIMIT);

console.log(`\n  file        ${file}`);
console.log(`  endpoint    ${ENDPOINT}`);
console.log(`  mode        ${SEND ? "SEND (messages will go out)" : "DRY RUN (nothing sent)"}`);
console.log(`  queued      ${batch.length}${queue.length > batch.length ? ` of ${queue.length} (--limit)` : ""}`);
console.log(`  skipped     ${skipped.length}\n`);

for (const [n, why] of skipped.slice(0, 12)) console.log(`  skip  ${n} — ${why}`);
if (skipped.length > 12) console.log(`  skip  …and ${skipped.length - 12} more`);
if (skipped.length) console.log("");

if (!SEND) {
  for (const c of batch.slice(0, 15)) {
    console.log(`  would send  ${c.name.padEnd(22)} ${(c.phone || c.email || "").padEnd(24)} ${c.lang}`);
  }
  if (batch.length > 15) console.log(`  …and ${batch.length - 15} more`);
  console.log(`\n  Re-run with --send to actually send.\n`);
  process.exit(0);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let ok = 0, fail = 0;

for (const [i, c] of batch.entries()) {
  const { key, ...payload } = c;
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-lead-secret": SECRET },
      body: JSON.stringify(payload),
    });
    const body = await res.json().catch(() => ({}));
    if (res.ok) {
      ok++;
      appendFileSync(SENT_LOG, `${new Date().toISOString()}\t${key}\t${c.name}\n`);
      console.log(`  [${i + 1}/${batch.length}] sent  ${c.name}`);
    } else {
      fail++;
      console.log(`  [${i + 1}/${batch.length}] FAIL  ${c.name} — ${res.status} ${JSON.stringify(body).slice(0, 120)}`);
    }
  } catch (e) {
    fail++;
    console.log(`  [${i + 1}/${batch.length}] FAIL  ${c.name} — ${e.message}`);
  }
  if (i < batch.length - 1) await sleep(DELAY_MS);
}

console.log(`\n  done. sent ${ok}, failed ${fail}. Log: ${SENT_LOG}\n`);
