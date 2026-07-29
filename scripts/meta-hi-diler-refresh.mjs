#!/usr/bin/env node
/**
 * Activate High-Income EN (best engine), refresh creatives with TORO-DILER assets.
 *
 * - Uploads 4x5 (and optional 9x16) images from TORO-DILER exports-fixed
 * - Creates NEW ads in the same ad sets (Option B — keeps winners, new image)
 * - Activates campaign + priority ad sets under a combined daily budget cap
 *
 * Usage:
 *   node scripts/meta-hi-diler-refresh.mjs           # dry-run
 *   node scripts/meta-hi-diler-refresh.mjs --apply   # execute
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, basename, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";

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
const PAGE_ID = process.env.META_PAGE_ID || "722514634274519";
const IG_USER = process.env.META_IG_USER_ID || "17841470412443785";
const PIXEL = process.env.NEXT_PUBLIC_META_PIXEL_ID || "985575491098437";

const HI_CAMPAIGN = "120249400265720325";
const ADSET_LABOR = "120250020261220325"; // Labor-only · Broad Central FL
const ADSET_FS_CR = "120251219580310325"; // Full-Service · CompleteReg
const ADSET_HI_FEED = "120249400265990325"; // HI · Feed · Medium-High Income
const ADSET_RETARGET = "120250787707350325"; // leave paused

// Combined daily budget cap across activated ad sets (cents)
const MAX_DAILY_CENTS = 2500; // $25
const BUDGETS = {
  [ADSET_FS_CR]: 1200, // $12 full-service
  [ADSET_LABOR]: 800, // $8 labor winners
  [ADSET_HI_FEED]: 500, // $5 HI feed refresh
};

const CREATIVE_DIR =
  process.env.DILER_DIR ||
  join(homedir(), "Downloads/TORO-DILER/exports-fixed/feed-4x5");

/** Source ads (clone copy/link) → new image file + slug */
const SWAPS = [
  {
    sourceAdId: "120251049087540325", // st-yourtruck2 labor — best CPL volume
    adsetId: ADSET_LABOR,
    file: "protection_sofa_4x5.jpg",
    slug: "labor-yourtruck-diler-sofa",
    name: "Ad · st-yourtruck2 · diler sofa · 2026-07-28",
  },
  {
    sourceAdId: "120251219794710325", // pt2-welift labor
    adsetId: ADSET_LABOR,
    file: "wrap_protect_4x5.jpg",
    slug: "labor-welift-diler-wrap",
    name: "Ad · pt2-welift · diler wrap · 2026-07-28",
  },
  {
    sourceAdId: "120251219590730325", // pt-doortruck CR full
    adsetId: ADSET_FS_CR,
    file: "orlando_ontime_b_4x5.jpg",
    slug: "fs-doortruck-diler-orlando",
    name: "Ad · pt-doortruck · diler orlando · 2026-07-28",
  },
  {
    sourceAdId: "120251219589450325", // pt-apartment CR
    adsetId: ADSET_FS_CR,
    file: "family_trust_4x5.jpg",
    slug: "fs-apartment-diler-family",
    name: "Ad · pt-apartment · diler family · 2026-07-28",
  },
  {
    sourceAdId: "120251049087360325", // pt-doorstep2 full HI feed
    adsetId: ADSET_HI_FEED,
    file: "trusted_local_4x5.jpg",
    slug: "hi-doorstep-diler-trusted",
    name: "Ad · pt-doorstep2 · diler trusted · 2026-07-28",
  },
  {
    sourceAdId: "120251049087240325", // pt-nohidden2 (was 0 leads — new creative)
    adsetId: ADSET_HI_FEED,
    file: "protection_boxes_4x5.jpg",
    slug: "hi-nohidden-diler-boxes",
    name: "Ad · pt-nohidden2 · diler boxes · 2026-07-28",
  },
  {
    sourceAdId: "120251219588990325", // pt-home CR
    adsetId: ADSET_FS_CR,
    file: "protection_fridge_4x5.jpg",
    slug: "fs-home-diler-fridge",
    name: "Ad · pt-home · diler fridge · 2026-07-28",
  },
  {
    sourceAdId: "120251049087540325", // second labor angle
    adsetId: ADSET_LABOR,
    file: "reliable_feed_4x5.jpg",
    slug: "labor-reliable-diler",
    name: "Ad · labor · diler reliable · 2026-07-28",
  },
];

if (!TOKEN) {
  console.error("META_ACCESS_TOKEN missing");
  process.exit(1);
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

function withUtm(link, slug) {
  try {
    const u = new URL(link);
    u.searchParams.set("utm_source", "meta");
    u.searchParams.set("utm_medium", "paid_social");
    u.searchParams.set("utm_campaign", "hi_diler_20260728");
    u.searchParams.set("utm_content", slug);
    return u.toString();
  } catch {
    return link;
  }
}

async function main() {
  console.log("=== HI EN + TORO-DILER creative refresh ===");
  console.log(`Mode: ${APPLY ? "APPLY" : "DRY-RUN"}`);
  console.log(`Creative dir: ${CREATIVE_DIR}`);
  console.log(
    `Budget cap: $${(MAX_DAILY_CENTS / 100).toFixed(2)}/day across activated ad sets`,
  );

  // Validate files
  for (const s of SWAPS) {
    const p = join(CREATIVE_DIR, s.file);
    if (!existsSync(p)) {
      console.error("Missing file:", p);
      process.exit(1);
    }
  }

  const budgetSum = Object.values(BUDGETS).reduce((a, b) => a + b, 0);
  if (budgetSum > MAX_DAILY_CENTS) {
    console.error("Budget sum exceeds cap", budgetSum, MAX_DAILY_CENTS);
    process.exit(1);
  }

  const journal = {
    started_at: new Date().toISOString(),
    apply: APPLY,
    campaign_id: HI_CAMPAIGN,
    swaps: [],
    activations: [],
    errors: [],
  };

  // 1) Upload images
  const hashByFile = {};
  for (const s of SWAPS) {
    if (hashByFile[s.file]) continue;
    const p = join(CREATIVE_DIR, s.file);
    console.log(APPLY ? "Upload" : "Would upload", s.file);
    if (APPLY) {
      hashByFile[s.file] = await uploadImage(p);
      console.log("  hash", hashByFile[s.file]);
    } else {
      hashByFile[s.file] = "dry-run-hash";
    }
  }

  // 2) For each swap: clone creative + create ad
  for (const s of SWAPS) {
    console.log("\n---", s.name, "---");
    const src = await api("GET", s.sourceAdId, {
      fields:
        "id,name,adset_id,status,creative{id,object_story_spec,url_tags}",
    });
    const cr = src.creative || {};
    const oss = cr.object_story_spec || {};
    const ld = oss.link_data || {};
    if (!ld.link && !ld.call_to_action) {
      console.error("Source has no link_data", s.sourceAdId);
      journal.errors.push({ swap: s.slug, error: "no_link_data" });
      continue;
    }

    const link = withUtm(
      ld.link || ld.call_to_action?.value?.link || "",
      s.slug,
    );
    const message = ld.message || "";
    const title = ld.name || "Central Florida Movers";
    const description = ld.description || "Free quote · Family-owned";
    const ctaType = ld.call_to_action?.type || "GET_QUOTE";
    const imageHash = hashByFile[s.file];
    const pageId = oss.page_id || PAGE_ID;
    const ig = oss.instagram_user_id || oss.instagram_actor_id || IG_USER;

    const storySpec = {
      page_id: pageId,
      link_data: {
        link,
        message,
        name: title,
        description,
        image_hash: imageHash,
        call_to_action: {
          type: ctaType,
          value: { link },
        },
      },
    };
    if (ig) storySpec.instagram_user_id = ig;

    console.log("  source:", src.name);
    console.log("  link:", link);
    console.log("  image:", s.file, "→", imageHash);

    if (!APPLY) {
      journal.swaps.push({ ...s, dry_run: true, link });
      continue;
    }

    try {
      const creative = await api("POST", `${ACCT}/adcreatives`, {
        name: `Creative · ${s.slug} · 2026-07-28`,
        object_story_spec: JSON.stringify(storySpec),
      });
      console.log("  creative_id", creative.id);

      const ad = await api("POST", `${ACCT}/ads`, {
        name: s.name,
        adset_id: s.adsetId,
        creative: JSON.stringify({ creative_id: creative.id }),
        status: "ACTIVE",
      });
      console.log("  ad_id", ad.id, "ACTIVE");
      journal.swaps.push({
        ...s,
        creative_id: creative.id,
        ad_id: ad.id,
        image_hash: imageHash,
        link,
      });
    } catch (err) {
      console.error("  FAIL", err.message);
      journal.errors.push({ swap: s.slug, error: String(err.message) });
    }
  }

  // 3) Activate ad sets with budgets + campaign
  if (APPLY) {
    console.log("\n=== Activating ad sets & campaign ===");
    for (const [adsetId, budget] of Object.entries(BUDGETS)) {
      try {
        await api("POST", adsetId, {
          status: "ACTIVE",
          daily_budget: String(budget),
        });
        console.log("Ad set ACTIVE", adsetId, `$${budget / 100}/day`);
        journal.activations.push({
          type: "adset",
          id: adsetId,
          daily_budget_cents: budget,
        });
      } catch (err) {
        console.error("Ad set fail", adsetId, err.message);
        journal.errors.push({ adset: adsetId, error: String(err.message) });
      }
    }
    // Keep retarget paused
    try {
      await api("POST", ADSET_RETARGET, { status: "PAUSED" });
      console.log("Retarget left/set PAUSED", ADSET_RETARGET);
    } catch (err) {
      console.warn("Retarget pause warn", err.message);
    }

    try {
      await api("POST", HI_CAMPAIGN, { status: "ACTIVE" });
      console.log("Campaign ACTIVE", HI_CAMPAIGN);
      journal.activations.push({ type: "campaign", id: HI_CAMPAIGN });
    } catch (err) {
      console.error("Campaign fail", err.message);
      journal.errors.push({ campaign: HI_CAMPAIGN, error: String(err.message) });
    }
  } else {
    console.log("\nWould activate campaign", HI_CAMPAIGN);
    for (const [id, b] of Object.entries(BUDGETS)) {
      console.log(`Would activate ad set ${id} @ $${b / 100}/day`);
    }
  }

  const outDir = join(ROOT, "output");
  mkdirSync(outDir, { recursive: true });
  const outPath = join(
    outDir,
    `meta-hi-diler-refresh-${new Date().toISOString().slice(0, 10)}.json`,
  );
  journal.finished_at = new Date().toISOString();
  writeFileSync(outPath, JSON.stringify(journal, null, 2));
  console.log("\nJournal:", outPath);
  console.log(
    APPLY
      ? "Done. Check Ads Manager — HI EN should be live with Diler creatives."
      : "Dry-run only. Re-run with --apply to execute.",
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
