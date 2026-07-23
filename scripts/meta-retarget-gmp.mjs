#!/usr/bin/env node
/**
 * Re-point Meta ads that land on SEO/service LPs to the sales funnel
 * (/get-my-price). Creates a new creative per ad and swaps it in.
 *
 * Usage:
 *   node scripts/meta-retarget-gmp.mjs           # dry-run
 *   node scripts/meta-retarget-gmp.mjs --apply   # write changes
 *
 * Env: META_ACCESS_TOKEN from .env.wire
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

function loadEnvWire() {
  const p = join(ROOT, ".env.wire");
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#") || !t.includes("=")) continue;
    const i = t.indexOf("=");
    const k = t.slice(0, i).trim();
    const v = t.slice(i + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[k]) process.env[k] = v;
  }
}
loadEnvWire();

const APPLY = process.argv.includes("--apply");
const TOKEN = process.env.META_ACCESS_TOKEN;
const ACCT_RAW = process.env.META_AD_ACCOUNT_ID || "971361825561389";
const ACCT = ACCT_RAW.startsWith("act_") ? ACCT_RAW : `act_${ACCT_RAW}`;
const API = "https://graph.facebook.com/v21.0";

if (!TOKEN) {
  console.error("META_ACCESS_TOKEN missing");
  process.exit(1);
}

const FUNNEL = "https://toromovers.net/get-my-price";
const FUNNEL_ES = "https://toromovers.net/es/get-my-price";

/** Paths we rewrite → funnel (service inferred from path / params). */
const REWRITE_HOSTS = new Set([
  "toromovers.net",
  "www.toromovers.net",
  "toromoveit.com",
  "www.toromoveit.com",
  "go.toromovers.net",
]);

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function api(method, path, fields = {}) {
  const url = new URL(`${API}/${path}`);
  const body = new URLSearchParams();
  body.set("access_token", TOKEN);
  for (const [k, v] of Object.entries(fields)) {
    if (v === undefined || v === null) continue;
    body.set(k, typeof v === "string" ? v : JSON.stringify(v));
  }
  let res;
  if (method === "GET") {
    for (const [k, v] of body.entries()) url.searchParams.set(k, v);
    res = await fetch(url);
  } else {
    res = await fetch(url, { method, body });
  }
  const data = await res.json();
  if (data.error) {
    const e = new Error(data.error.message || JSON.stringify(data.error));
    e.code = data.error.code;
    e.raw = data.error;
    throw e;
  }
  return data;
}

function mapLink(raw) {
  if (!raw || typeof raw !== "string") return null;
  let u;
  try {
    u = new URL(raw);
  } catch {
    return null;
  }
  const host = u.hostname.replace(/^www\./, "");
  if (!["toromovers.net", "toromoveit.com", "go.toromovers.net"].includes(host)) {
    return null;
  }
  const path = u.pathname.replace(/\/$/, "") || "/";
  // Already funnel
  if (path === "/get-my-price" || path === "/es/get-my-price") return null;
  // Call-only facebook.com — skip
  if (u.hostname.includes("facebook.com")) return null;

  const labor =
    /labor/i.test(path) ||
    /labor/i.test(u.searchParams.get("servicetype") || "") ||
    /labor/i.test(u.searchParams.get("service") || "") ||
    path.includes("loading-help");

  const isEs =
    path.startsWith("/es") ||
    path === "/mudanza" ||
    /mudanza/i.test(u.search);

  const base = isEs ? FUNNEL_ES : FUNNEL;
  const out = new URL(base);
  out.searchParams.set("service", labor ? "labor" : "full-service");
  out.searchParams.set("source", "meta-retarget-gmp");

  // Preserve UTMs + click ids
  for (const key of [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term",
    "fbclid",
    "gclid",
  ]) {
    const v = u.searchParams.get(key);
    if (v) out.searchParams.set(key, v);
  }
  if (!out.searchParams.get("utm_source")) {
    out.searchParams.set("utm_source", "meta");
    out.searchParams.set("utm_medium", "paid_social");
  }
  return out.toString();
}

function extractLink(creative) {
  const spec = creative.object_story_spec || {};
  const ld = spec.link_data || {};
  if (ld.link) return ld.link;
  const vd = spec.video_data || {};
  const cta = vd.call_to_action?.value?.link;
  if (cta) return cta;
  if (creative.link_url) return creative.link_url;
  return null;
}

function rewriteStorySpec(spec, newLink) {
  const next = JSON.parse(JSON.stringify(spec));
  if (next.link_data) {
    next.link_data.link = newLink;
    if (next.link_data.call_to_action?.value) {
      next.link_data.call_to_action.value.link = newLink;
    }
  }
  if (next.video_data?.call_to_action?.value) {
    next.video_data.call_to_action.value.link = newLink;
  }
  return next;
}

async function main() {
  console.log(APPLY ? "APPLY mode" : "DRY-RUN mode");
  const ads = await api("GET", `${ACCT}/ads`, {
    fields:
      "id,name,status,effective_status,creative{id,name,object_story_spec,link_url,image_hash,body,title}",
    filtering: JSON.stringify([
      {
        field: "effective_status",
        operator: "IN",
        value: [
          "ACTIVE",
          "PENDING_REVIEW",
          "IN_PROCESS",
          "PREAPPROVED",
          "PAUSED",
          "ADSET_PAUSED",
          "CAMPAIGN_PAUSED",
        ],
      },
    ]),
    limit: 200,
  });

  const targets = [];
  for (const ad of ads.data || []) {
    const creative = ad.creative || {};
    const link = extractLink(creative);
    const mapped = mapLink(link);
    if (!mapped) continue;
    // Prefer ACTIVE / pending first
    targets.push({
      ad,
      creative,
      oldLink: link,
      newLink: mapped,
      priority:
        ad.effective_status === "ACTIVE"
          ? 0
          : ad.effective_status === "IN_PROCESS" ||
              ad.effective_status === "PENDING_REVIEW"
            ? 1
            : 2,
    });
  }
  targets.sort((a, b) => a.priority - b.priority);

  console.log(`Ads to retarget: ${targets.length}`);
  for (const t of targets) {
    console.log(
      `  [${t.ad.effective_status}] ${t.ad.name}\n    ${t.oldLink}\n -> ${t.newLink}`,
    );
  }

  if (!APPLY) {
    console.log("\nRe-run with --apply to update creatives.");
    return;
  }

  const journal = {
    stamp: new Date().toISOString(),
    updated: [],
    errors: [],
  };

  // Only rewrite ACTIVE + in-review ads by default (live traffic).
  // Paused get left alone unless --all
  const ALL = process.argv.includes("--all");
  const work = targets.filter((t) =>
    ALL
      ? true
      : ["ACTIVE", "PENDING_REVIEW", "IN_PROCESS", "PREAPPROVED"].includes(
          t.ad.effective_status,
        ),
  );
  console.log(`\nUpdating ${work.length} live ads…`);

  for (const t of work) {
    try {
      const spec = t.creative.object_story_spec;
      if (!spec?.link_data && !spec?.video_data) {
        throw new Error("No object_story_spec link/video data");
      }
      const newSpec = rewriteStorySpec(spec, t.newLink);
      // Create new creative
      const created = await api("POST", `${ACCT}/adcreatives`, {
        name: `${t.creative.name || t.ad.name} · gmp`.slice(0, 100),
        object_story_spec: newSpec,
      });
      await sleep(400);
      // Attach to ad
      await api("POST", t.ad.id, {
        creative: { creative_id: created.id },
      });
      journal.updated.push({
        ad_id: t.ad.id,
        name: t.ad.name,
        old: t.oldLink,
        new: t.newLink,
        creative_id: created.id,
      });
      console.log(`  ✓ ${t.ad.id} → creative ${created.id}`);
      await sleep(600);
    } catch (err) {
      console.error(`  ✗ ${t.ad.id}: ${err.message}`);
      journal.errors.push({ ad_id: t.ad.id, error: err.message });
      await sleep(800);
    }
  }

  const outDir = join(ROOT, "output/meta-launches");
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, `retarget-gmp-${Date.now()}.json`);
  writeFileSync(outPath, JSON.stringify(journal, null, 2));
  console.log(`\nJournal: ${outPath}`);
  console.log(`Updated: ${journal.updated.length}  Errors: ${journal.errors.length}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
