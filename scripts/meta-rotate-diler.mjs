#!/usr/bin/env node
/**
 * Toro Diler creative rotation — pause losers, activate next bench asset.
 *
 * Authorized policy (user 2026-07-23):
 *   - Wait ≥3 days after launch before any rotation
 *   - Need minimum delivery before judging
 *   - Pause losers; create NEW ads from staged bench (do not delete winners)
 *   - Keep ad-set daily budget ≤ $25
 *
 * Usage:
 *   node scripts/meta-rotate-diler.mjs              # dry-run report
 *   node scripts/meta-rotate-diler.mjs --apply      # pause losers + launch bench
 *   node scripts/meta-rotate-diler.mjs --force      # ignore 3-day gate (still needs volume)
 *
 * Env: META_ACCESS_TOKEN (from .env.wire or shell)
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname, basename } from "node:path";
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
const FORCE = process.argv.includes("--force");
const TOKEN = process.env.META_ACCESS_TOKEN;
const ACCT_RAW = process.env.META_AD_ACCOUNT_ID || "971361825561389";
const ACCT = ACCT_RAW.startsWith("act_") ? ACCT_RAW : `act_${ACCT_RAW}`;
const API = "https://graph.facebook.com/v21.0";
const PAGE_ID = process.env.META_PAGE_ID || "722514634274519";
const IG_USER = process.env.META_IG_USER_ID || "17841470412443785";
const PIXEL = process.env.NEXT_PUBLIC_META_PIXEL_ID || "985575491098437";

const LAUNCH_JOURNAL = join(ROOT, "output/meta-launches/fs-diler-2026-07-23.json");
const STATE_PATH = join(ROOT, "output/meta-launches/diler-rotation-state.json");
const ASSET_DIR =
  process.env.DILER_ASSET_DIR ||
  "/Users/vynstudio/toro-ads-landing/public/ads/toro-diler-2026-07";
// Canonical paid landing = sales funnel (contact-first lead form)
const LP =
  "https://toromovers.net/get-my-price?service=full-service&source=meta-diler";
const UTM_CAMPAIGN = "fs_diler_20260723";

/** Launch day (UTC date) for the 3-day gate. */
const LAUNCH_DATE = "2026-07-23";
const MIN_DAYS = 3;

/** Volume gates before judging a single ad. */
const MIN_IMPR = 800;
const MIN_SPEND = 8;
/** Hard loser: spend with zero leads. */
const ZERO_LEAD_SPEND = 10;
/** CPL ceiling (USD). */
const CPL_KILL = 40;
/** Relative kill vs ad-set average. */
const CPL_MULT = 1.5;
const CTR_MULT = 0.7;

/**
 * Bench pool — staged files not in the original launch set.
 * Order = rotation priority. Skip brand-risk (crew_truck wrong logo).
 */
const BENCH = [
  {
    file: "clean_story_b_9x16.jpg",
    slug: "diler_stories_carry_b",
    primary:
      "Professional local movers you can trust. Family-owned Central Florida crew — free quote at toromovers.net.",
    headline: "Get a free quote today",
    description: "Bilingual · Family-owned",
  },
  {
    file: "orlando_ontime_b_4x5.jpg",
    slug: "diler_orlando_ontime_b",
    primary:
      "Moving in Orlando or Central Florida? Careful handling and on-time service. Truck + crew — free quote today.",
    headline: "Orlando movers · On time",
    description: "Get quote · toromovers.net",
  },
  {
    file: "protection_boxes_4x5.jpg",
    slug: "diler_protection_boxes",
    primary:
      "Trusted movers across Central Florida. Professional team, careful handling, stress-free moves. Free quote at toromovers.net.",
    headline: "Trusted Central FL movers",
    description: "Free quote · Family-owned",
  },
  {
    file: "protection_fridge_4x5.jpg",
    slug: "diler_protection_fridge",
    primary:
      "Trusted movers across Central Florida. Careful handling of heavy items — free quote, up-front pricing.",
    headline: "Careful movers · Free quote",
    description: "Full-service · Central FL",
  },
  {
    file: "protection_family_4x5.jpg",
    slug: "diler_protection_family",
    primary:
      "Family-owned Central Florida movers. Careful service, bilingual crew. Get your free quote at toromovers.net.",
    headline: "Family-owned · Free quote",
    description: "Orlando & Central Florida",
  },
];

if (!TOKEN) {
  console.error("META_ACCESS_TOKEN missing");
  process.exit(1);
}

function loadJson(path, fallback) {
  if (!existsSync(path)) return fallback;
  return JSON.parse(readFileSync(path, "utf8"));
}

function daysSinceLaunch() {
  const launch = new Date(`${LAUNCH_DATE}T00:00:00Z`);
  const now = new Date();
  return Math.floor((now - launch) / (24 * 60 * 60 * 1000));
}

async function api(method, path, fields = {}) {
  const url = `${API}/${path}`;
  let res;
  if (method === "GET") {
    const q = new URLSearchParams({ ...fields, access_token: TOKEN });
    res = await fetch(`${url}?${q}`);
  } else {
    const body = new URLSearchParams({ ...fields, access_token: TOKEN });
    res = await fetch(url, { method, body });
  }
  const data = await res.json();
  if (data.error) {
    const e = data.error;
    throw new Error(
      `${method} ${path}: ${e.message}${e.error_user_msg ? " | " + e.error_user_msg : ""}`,
    );
  }
  return data;
}

function actionsMap(row) {
  const m = {};
  for (const a of row?.actions || []) m[a.action_type] = Number(a.value);
  return m;
}

function leadCount(act) {
  for (const k of [
    "lead",
    "offsite_conversion.fb_pixel_lead",
    "onsite_conversion.lead_grouped",
    "onsite_web_lead",
    "offsite_conversion.fb_pixel_custom",
  ]) {
    if (act[k] != null) return act[k];
  }
  let total = 0;
  for (const [k, v] of Object.entries(act)) {
    if (k.toLowerCase().includes("lead")) total += v;
  }
  return total;
}

function utm(slug) {
  const u = new URL(LP);
  u.searchParams.set("utm_source", "meta");
  u.searchParams.set("utm_medium", "paid_social");
  u.searchParams.set("utm_campaign", UTM_CAMPAIGN);
  u.searchParams.set("utm_content", slug);
  u.searchParams.set("utm_term", "full_service");
  return u.toString();
}

async function uploadImage(filePath) {
  const buf = readFileSync(filePath);
  const b64 = buf.toString("base64");
  const data = await api("POST", `${ACCT}/adimages`, {
    bytes: b64,
    name: basename(filePath),
  });
  const images = data.images || {};
  const first = Object.values(images)[0];
  if (!first?.hash) throw new Error("No image hash for " + filePath);
  return first.hash;
}

function isLoser(ad, setAvg) {
  const reasons = [];
  const enough =
    ad.impressions >= MIN_IMPR || ad.spend >= MIN_SPEND;
  if (!enough) {
    return { loser: false, reasons: ["insufficient volume"], enough: false };
  }

  if (ad.leads === 0 && ad.spend >= ZERO_LEAD_SPEND) {
    reasons.push(`$0 leads with $${ad.spend.toFixed(2)} spend`);
  }
  if (ad.cpl != null && ad.cpl >= CPL_KILL && ad.spend >= MIN_SPEND) {
    reasons.push(`CPL $${ad.cpl.toFixed(2)} ≥ kill $${CPL_KILL}`);
  }
  if (
    setAvg.avgCpl != null &&
    ad.cpl != null &&
    ad.leads > 0 &&
    ad.cpl > setAvg.avgCpl * CPL_MULT
  ) {
    reasons.push(
      `CPL $${ad.cpl.toFixed(2)} > ${CPL_MULT}× set avg $${setAvg.avgCpl.toFixed(2)}`,
    );
  }
  if (
    setAvg.avgCtr > 0 &&
    ad.impressions >= MIN_IMPR &&
    ad.ctr < setAvg.avgCtr * CTR_MULT
  ) {
    reasons.push(
      `CTR ${ad.ctr.toFixed(2)}% < ${CTR_MULT}× set avg ${setAvg.avgCtr.toFixed(2)}%`,
    );
  }

  return { loser: reasons.length > 0, reasons, enough: true };
}

async function main() {
  const days = daysSinceLaunch();
  const stamp = new Date().toISOString().slice(0, 10);
  console.log("=== Toro Diler rotation check ===");
  console.log(`Mode: ${APPLY ? "APPLY" : "DRY-RUN"} · days since launch: ${days} (need ${MIN_DAYS})`);
  console.log(`Force: ${FORCE}`);

  const journal = loadJson(LAUNCH_JOURNAL, null);
  if (!journal?.adset_id || !journal?.ads?.length) {
    throw new Error(`Missing launch journal: ${LAUNCH_JOURNAL}`);
  }
  const adsetId = journal.adset_id;
  const campaignId = journal.campaign_id;

  const state = loadJson(STATE_PATH, {
    launch_date: LAUNCH_DATE,
    used_slugs: journal.ads.map((a) => a.slug),
    used_files: journal.ads.map((a) => a.file),
    rotations: [],
  });

  if (days < MIN_DAYS && !FORCE) {
    console.log(
      `NO-OP: only ${days} day(s) since ${LAUNCH_DATE}. Rotation authorized after ${MIN_DAYS} days.`,
    );
    console.log("Re-run with --force only if you intentionally skip the wait.");
    process.exit(0);
  }

  // Insights last_7d for ads in this ad set
  const insights = await api("GET", `${ACCT}/insights`, {
    level: "ad",
    date_preset: "last_7d",
    fields:
      "ad_id,ad_name,spend,impressions,clicks,ctr,cpc,actions,inline_link_clicks",
    filtering: JSON.stringify([
      { field: "adset.id", operator: "EQUAL", value: adsetId },
    ]),
    limit: "100",
  });

  const byId = {};
  for (const row of insights.data || []) {
    const act = actionsMap(row);
    const leads = leadCount(act);
    const spend = Number(row.spend || 0);
    const impr = Number(row.impressions || 0);
    const ctr = Number(row.ctr || 0);
    byId[row.ad_id] = {
      id: row.ad_id,
      name: row.ad_name,
      spend,
      impressions: impr,
      clicks: Number(row.clicks || 0),
      ctr,
      cpc: Number(row.cpc || 0),
      leads,
      cpl: leads > 0 ? spend / leads : null,
    };
  }

  // Active Diler ads (from API status)
  const adsRes = await api("GET", `${ACCT}/ads`, {
    fields: "id,name,status,effective_status,adset_id",
    limit: "100",
    filtering: JSON.stringify([
      { field: "adset.id", operator: "EQUAL", value: adsetId },
    ]),
  });

  const active = (adsRes.data || []).filter(
    (a) =>
      a.effective_status === "ACTIVE" ||
      a.effective_status === "IN_PROCESS" ||
      a.effective_status === "PENDING_REVIEW" ||
      a.status === "ACTIVE",
  );

  const scored = active.map((a) => {
    const m = byId[a.id] || {
      id: a.id,
      name: a.name,
      spend: 0,
      impressions: 0,
      clicks: 0,
      ctr: 0,
      cpc: 0,
      leads: 0,
      cpl: null,
    };
    return { ...m, status: a.status, effective_status: a.effective_status };
  });

  let totSpend = 0;
  let totLeads = 0;
  let totImpr = 0;
  let ctrW = 0;
  for (const a of scored) {
    totSpend += a.spend;
    totLeads += a.leads;
    totImpr += a.impressions;
    ctrW += a.ctr * a.impressions;
  }
  const setAvg = {
    avgCpl: totLeads > 0 ? totSpend / totLeads : null,
    avgCtr: totImpr > 0 ? ctrW / totImpr : 0,
    spend: totSpend,
    leads: totLeads,
  };

  console.log(
    `Ad set 7d: $${totSpend.toFixed(2)} · ${totLeads} leads · avg CPL ${setAvg.avgCpl != null ? "$" + setAvg.avgCpl.toFixed(2) : "n/a"} · avg CTR ${setAvg.avgCtr.toFixed(2)}%`,
  );
  console.log("\nActive ads:");
  const losers = [];
  const keepers = [];
  for (const a of scored) {
    const j = isLoser(a, setAvg);
    const tag = !j.enough ? "WAIT" : j.loser ? "LOSER" : "OK";
    console.log(
      `  [${tag}] ${a.name}\n         spend $${a.spend.toFixed(2)} impr ${a.impressions} CTR ${a.ctr.toFixed(2)}% leads ${a.leads} CPL ${a.cpl != null ? "$" + a.cpl.toFixed(2) : "—"} · ${a.effective_status}`,
    );
    if (j.reasons.length) console.log(`         → ${j.reasons.join("; ")}`);
    if (j.loser) losers.push({ ...a, reasons: j.reasons });
    else if (j.enough) keepers.push(a);
  }

  // Bench remaining
  const usedFiles = new Set(state.used_files || []);
  const usedSlugs = new Set(state.used_slugs || []);
  const available = BENCH.filter(
    (b) => !usedFiles.has(b.file) && !usedSlugs.has(b.slug) && existsSync(join(ASSET_DIR, b.file)),
  );
  console.log(`\nBench available: ${available.length}`);
  for (const b of available) console.log(`  - ${b.slug} (${b.file})`);

  if (!losers.length) {
    console.log("\nNo losers meeting volume + efficiency gates. No rotation.");
    process.exit(0);
  }
  if (!available.length) {
    console.log("\nLosers found but bench empty — pause only if --apply.");
  }

  const plan = [];
  let bi = 0;
  for (const L of losers) {
    const repl = available[bi++] || null;
    plan.push({ loser: L, replacement: repl });
  }

  console.log("\n--- Rotation plan ---");
  for (const p of plan) {
    console.log(
      `PAUSE ${p.loser.name} (${p.loser.id})\n  reasons: ${p.loser.reasons.join("; ")}`,
    );
    if (p.replacement) {
      console.log(`  REPLACE → ${p.replacement.slug} · ${p.replacement.file}`);
    } else {
      console.log(`  REPLACE → (none left — pause only)`);
    }
  }

  if (!APPLY) {
    console.log("\nDry-run only. Re-run with --apply to execute.");
    process.exit(0);
  }

  const result = {
    at: new Date().toISOString(),
    days_since_launch: days,
    set_avg: setAvg,
    actions: [],
  };

  for (const p of plan) {
    // Pause loser
    await api("POST", p.loser.id, { status: "PAUSED" });
    result.actions.push({ type: "pause", ad_id: p.loser.id, name: p.loser.name, reasons: p.loser.reasons });
    console.log("Paused", p.loser.name);

    if (!p.replacement) continue;

    const filePath = join(ASSET_DIR, p.replacement.file);
    console.log("Upload", p.replacement.file);
    const hash = await uploadImage(filePath);
    const link = utm(p.replacement.slug);
    const story = {
      page_id: PAGE_ID,
      instagram_user_id: IG_USER,
      link_data: {
        image_hash: hash,
        link,
        message: p.replacement.primary,
        name: p.replacement.headline,
        description: p.replacement.description,
        call_to_action: { type: "GET_QUOTE", value: { link } },
      },
    };
    const creative = await api("POST", `${ACCT}/adcreatives`, {
      name: `Creative · Diler · ${p.replacement.slug} · ${stamp}`,
      object_story_spec: JSON.stringify(story),
    });
    const adName = `Ad · Diler · ${p.replacement.slug} · ${stamp}`;
    const ad = await api("POST", `${ACCT}/ads`, {
      name: adName,
      adset_id: adsetId,
      creative: JSON.stringify({ creative_id: creative.id }),
      status: "PAUSED",
    });
    await api("POST", ad.id, { status: "ACTIVE" });
    await api("POST", campaignId, { status: "ACTIVE" });
    await api("POST", adsetId, { status: "ACTIVE" });

    state.used_slugs = [...(state.used_slugs || []), p.replacement.slug];
    state.used_files = [...(state.used_files || []), p.replacement.file];
    result.actions.push({
      type: "launch",
      ad_id: ad.id,
      name: adName,
      slug: p.replacement.slug,
      file: p.replacement.file,
      replaces: p.loser.id,
    });
    console.log("Launched", adName, ad.id);
  }

  state.rotations = [...(state.rotations || []), result];
  mkdirSync(dirname(STATE_PATH), { recursive: true });
  writeFileSync(STATE_PATH, JSON.stringify(state, null, 2));
  writeFileSync(
    join(ROOT, `output/meta-launches/diler-rotation-${stamp}.json`),
    JSON.stringify(result, null, 2),
  );
  console.log("\nDone. State:", STATE_PATH);
}

main().catch((e) => {
  console.error("ROTATE_FAILED", e.message || e);
  process.exit(1);
});
