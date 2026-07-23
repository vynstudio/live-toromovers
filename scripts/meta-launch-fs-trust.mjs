#!/usr/bin/env node
/**
 * Launch Toro Movers FULL-SERVICE trust creatives under a hard daily budget cap.
 *
 * Uses the 4 new assets in:
 *   toro-ads-landing/public/ads/full-service-trust-2026-07/
 *
 * Env (from .env.wire or shell):
 *   META_ACCESS_TOKEN (required)
 *   META_AD_ACCOUNT_ID (default 971361825561389)
 *   META_PAGE_ID, META_IG_USER_ID, NEXT_PUBLIC_META_PIXEL_ID (optional overrides)
 *
 * Usage:
 *   node scripts/meta-launch-fs-trust.mjs              # dry-run (default)
 *   node scripts/meta-launch-fs-trust.mjs --apply      # create + activate
 *   node scripts/meta-launch-fs-trust.mjs --apply --paused  # create but leave PAUSED
 *
 * Hard rules:
 *   - Max combined ACTIVE ad-set daily budget = $25 (override with --max-daily=25)
 *   - Full-service LP only (no labor URLs)
 *   - Does NOT re-enable labor campaigns
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, basename, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

// Load .env.wire if present (keys only used server-side; never logged)
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
const FORCE_PAUSED = process.argv.includes("--paused");
const maxArg = process.argv.find((a) => a.startsWith("--max-daily="));
const MAX_DAILY_USD = maxArg ? Number(maxArg.split("=")[1]) : 25;
const MAX_DAILY_CENTS = Math.round(MAX_DAILY_USD * 100);

const TOKEN = process.env.META_ACCESS_TOKEN;
const ACCT_RAW = process.env.META_AD_ACCOUNT_ID || "971361825561389";
const ACCT = ACCT_RAW.startsWith("act_") ? ACCT_RAW : `act_${ACCT_RAW}`;
const API = "https://graph.facebook.com/v21.0";
const PIXEL = process.env.NEXT_PUBLIC_META_PIXEL_ID || "985575491098437";
const PAGE_ID = process.env.META_PAGE_ID || "722514634274519";
const IG_USER = process.env.META_IG_USER_ID || "17841470412443785";

const CREATIVE_DIR =
  process.env.CREATIVE_DIR ||
  "/Users/vynstudio/toro-ads-landing/public/ads/full-service-trust-2026-07";

// Canonical paid landing = sales funnel (contact-first lead form)
const LP_BASE =
  "https://toromovers.net/get-my-price?service=full-service&source=meta-fs-trust";
const UTM_CAMPAIGN = "fs_trust_20260723";

if (!TOKEN) {
  console.error("META_ACCESS_TOKEN missing");
  process.exit(1);
}

const CREATIVES = [
  {
    file: "fs-01-family-handshake.jpg",
    slug: "family_handshake",
    primary:
      "Family-owned Central Florida movers. Careful, professional full-service moving — truck, crew, and protection included. Up-front hourly pricing, no hidden fees.",
    headline: "Careful movers · Free quote",
    description: "Orlando & Central Florida · 4.9★",
    note: "Trust / family handshake — brand-safe",
  },
  {
    file: "fs-02-wrap-protect.jpg",
    slug: "wrap_protect",
    primary:
      "We pad, wrap, and place — so your furniture arrives the way it left. Trusted local movers across Central Florida. Get your free quote in 60 seconds.",
    headline: "Careful service · Central FL",
    description: "Full-service · protected loads",
    note: "Proof of careful packing — best match to quality angle",
  },
  {
    file: "fs-03-relax-truck.jpg",
    slug: "relax_truck",
    primary:
      "You relax. We load the truck. Full-service moving across Orlando, Kissimmee, Clermont & Central Florida — same crew that quotes shows up.",
    headline: "Trusted local movers",
    description: "Truck + crew included",
    note: "Outcome / stress-free lifestyle",
  },
  {
    file: "fs-04-orlando-crew-truck.jpg",
    slug: "orlando_crew",
    primary:
      "Trusted local movers in Orlando. Free quote now — bilingual crew, up-front pricing, full-service truck included.",
    headline: "Orlando movers · Free quote",
    description: "Get a free quote now",
    note: "⚠️ Logo on polo looks non-Toro (M mark) — brand risk; keep in test but watch",
  },
];

function utm(content) {
  const u = new URL(LP_BASE);
  u.searchParams.set("utm_source", "meta");
  u.searchParams.set("utm_medium", "paid_social");
  u.searchParams.set("utm_campaign", UTM_CAMPAIGN);
  u.searchParams.set("utm_content", content);
  u.searchParams.set("utm_term", "full_service");
  return u.toString();
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
      `${method} ${path}: ${e.message}${e.error_user_msg ? " | " + e.error_user_msg : ""}${e.error_subcode ? " [" + e.error_subcode + "]" : ""}`,
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
  if (!first?.hash) {
    throw new Error("No image hash: " + JSON.stringify(data).slice(0, 300));
  }
  return first.hash;
}

async function sumActiveDailyBudgetCents() {
  const sets = await api("GET", `${ACCT}/adsets`, {
    fields: "id,name,daily_budget,effective_status",
    limit: "100",
    filtering: JSON.stringify([
      { field: "effective_status", operator: "IN", value: ["ACTIVE"] },
    ]),
  });
  let total = 0;
  const rows = [];
  for (const s of sets.data || []) {
    const cents = Number(s.daily_budget || 0);
    total += cents;
    rows.push({ id: s.id, name: s.name, daily_usd: cents / 100 });
  }
  return { total, rows };
}

async function pauseLaborActive() {
  const sets = await api("GET", `${ACCT}/adsets`, {
    fields: "id,name,effective_status",
    limit: "100",
    filtering: JSON.stringify([
      {
        field: "effective_status",
        operator: "IN",
        value: ["ACTIVE"],
      },
    ]),
  });
  const paused = [];
  for (const s of sets.data || []) {
    if (/labor/i.test(s.name || "")) {
      if (APPLY) await api("POST", s.id, { status: "PAUSED" });
      paused.push(s.name);
    }
  }
  return paused;
}

async function main() {
  const stamp = new Date().toISOString().slice(0, 10);
  const status = FORCE_PAUSED || !APPLY ? "PAUSED" : "ACTIVE";

  console.log("=== Toro FULL-SERVICE trust launch ===");
  console.log(`Mode: ${APPLY ? (FORCE_PAUSED ? "APPLY (create PAUSED)" : "APPLY (ACTIVE)") : "DRY-RUN"}`);
  console.log(`Max daily: $${MAX_DAILY_USD}`);
  console.log(`Account ${ACCT} · Pixel ${PIXEL} · Page ${PAGE_ID}`);
  console.log(`Creative dir: ${CREATIVE_DIR}`);
  console.log(`Landing: ${LP_BASE}`);
  console.log("");

  // Validate files
  for (const c of CREATIVES) {
    const p = join(CREATIVE_DIR, c.file);
    if (!existsSync(p)) throw new Error(`Missing creative: ${p}`);
    console.log(`  ✓ ${c.file} — ${c.slug} — ${c.note}`);
  }
  console.log("");

  const acct = await api("GET", ACCT, {
    fields: "name,account_status,balance,currency,amount_spent",
  });
  const bal = Number(acct.balance || 0) / 100;
  console.log(
    `Account: ${acct.name} · status ${acct.account_status} · balance ~$${bal.toFixed(2)}`,
  );
  if (Number(acct.account_status) !== 1) {
    throw new Error("Ad account not ACTIVE");
  }
  if (bal < 20) {
    console.warn(
      `WARNING: low balance (~$${bal.toFixed(2)}). Top up before running a full day at $${MAX_DAILY_USD}.`,
    );
  }

  const { total: activeCents, rows: activeSets } =
    await sumActiveDailyBudgetCents();
  console.log(
    `Currently ACTIVE daily budget: $${(activeCents / 100).toFixed(2)} across ${activeSets.length} ad set(s)`,
  );
  for (const r of activeSets) {
    console.log(`  - ${r.name}: $${r.daily_usd}`);
  }

  if (activeCents + MAX_DAILY_CENTS > MAX_DAILY_CENTS && activeSets.length) {
    // Cap means: after launch, total active should be ≤ MAX
    const headroom = MAX_DAILY_CENTS - activeCents;
    if (headroom < MAX_DAILY_CENTS) {
      console.log(
        `Headroom under $${MAX_DAILY_USD} cap: $${(headroom / 100).toFixed(2)}`,
      );
    }
  }

  // If anything else is active, we only launch if total stays ≤ cap
  // Strategy: this campaign uses the FULL $25, so other active sets must be paused first if any.
  if (activeCents > 0) {
    console.log(
      `\n⚠ ${activeSets.length} ad set(s) already ACTIVE ($${(activeCents / 100).toFixed(2)}/d).`,
    );
    console.log(
      `To honor $${MAX_DAILY_USD} max, this script will PAUSE them before activating the new set.`,
    );
  }

  const laborPaused = await pauseLaborActive();
  if (laborPaused.length) {
    console.log("Labor sets to pause:", laborPaused);
  }

  if (!APPLY) {
    console.log("\n--- DRY-RUN plan (no writes) ---");
    console.log(
      `Campaign: TM — Full Service Trust — ${stamp}  [OUTCOME_LEADS]`,
    );
    console.log(
      `Ad set: FS Trust · Central FL 45mi · $${MAX_DAILY_USD}/d · ${stamp}`,
    );
    console.log(`Budget: $${MAX_DAILY_USD}/day · optimization: OFFSITE_CONVERSIONS (Lead)`);
    console.log(`Geo: Orlando 45mi radius · age 25–64 · FB+IG`);
    console.log(`Ads (${CREATIVES.length}):`);
    for (const c of CREATIVES) {
      console.log(`  · ${c.slug}`);
      console.log(`    headline: ${c.headline}`);
      console.log(`    url: ${utm(c.slug)}`);
    }
    console.log("\nRe-run with --apply to create and activate.");
    console.log("Re-run with --apply --paused to create offline first.");
    return;
  }

  const journal = {
    stamp,
    max_daily_usd: MAX_DAILY_USD,
    pixel: PIXEL,
    page_id: PAGE_ID,
    campaign: null,
    adset: null,
    ads: [],
    images: {},
    urls: {},
    paused_prior: [],
  };

  // Pause other ACTIVE ad sets so total daily ≤ $25
  if (activeSets.length) {
    for (const s of activeSets) {
      await api("POST", s.id, { status: "PAUSED" });
      journal.paused_prior.push(s);
      console.log(`Paused prior active set: ${s.name} (${s.id})`);
    }
  }

  // Upload images
  for (const c of CREATIVES) {
    const path = join(CREATIVE_DIR, c.file);
    console.log("Upload", c.file);
    const hash = await uploadImage(path);
    journal.images[c.slug] = hash;
    console.log("  hash", hash.slice(0, 12) + "…");
  }

  // Campaign
  const campName = `TM — Full Service Trust — ${stamp}`;
  const camp = await api("POST", `${ACCT}/campaigns`, {
    name: campName,
    objective: "OUTCOME_LEADS",
    status: "PAUSED",
    special_ad_categories: JSON.stringify([]),
    is_adset_budget_sharing_enabled: "false",
  });
  journal.campaign = { id: camp.id, name: campName };
  console.log("Campaign", camp.id, campName);

  const targetingOrlando = {
    geo_locations: {
      custom_locations: [
        {
          latitude: 28.5383,
          longitude: -81.3792,
          radius: 45,
          distance_unit: "mile",
        },
      ],
      location_types: ["home", "recent"],
    },
    age_min: 25,
    age_max: 64,
    publisher_platforms: ["facebook", "instagram"],
    // Required by Meta (error 1870227) — set Advantage Audience on/off explicitly
    targeting_automation: {
      advantage_audience: 0,
    },
  };

  // Ad set — lead optimization on pixel
  const adsetName = `FS Trust · Central FL 45mi · $${MAX_DAILY_USD}/d · ${stamp}`;
  let adset;
  const adsetBase = {
    name: adsetName,
    campaign_id: camp.id,
    daily_budget: String(MAX_DAILY_CENTS),
    billing_event: "IMPRESSIONS",
    bid_strategy: "LOWEST_COST_WITHOUT_CAP",
    status: "PAUSED",
    targeting: JSON.stringify(targetingOrlando),
    dsa_beneficiary: "Toro Movers",
    dsa_payor: "Toro Movers",
  };

  try {
    adset = await api("POST", `${ACCT}/adsets`, {
      ...adsetBase,
      optimization_goal: "OFFSITE_CONVERSIONS",
      destination_type: "WEBSITE",
      promoted_object: JSON.stringify({
        pixel_id: PIXEL,
        custom_event_type: "LEAD",
      }),
    });
    console.log("Ad set (OFFSITE_CONVERSIONS/LEAD)", adset.id);
  } catch (e) {
    console.warn("Lead optimization failed, falling back to LINK_CLICKS:", e.message);
    adset = await api("POST", `${ACCT}/adsets`, {
      ...adsetBase,
      name: `FS Trust · LinkClicks · Central FL 45mi · $${MAX_DAILY_USD}/d · ${stamp}`,
      optimization_goal: "LINK_CLICKS",
      destination_type: "WEBSITE",
    });
    console.log("Ad set (LINK_CLICKS)", adset.id);
  }
  journal.adset = { id: adset.id, name: adsetName, daily_budget_usd: MAX_DAILY_USD };

  // Ads
  for (const c of CREATIVES) {
    const link = utm(c.slug);
    journal.urls[c.slug] = link;
    const hash = journal.images[c.slug];

    const storySpec = {
      page_id: PAGE_ID,
      instagram_user_id: IG_USER,
      link_data: {
        image_hash: hash,
        link,
        message: c.primary,
        name: c.headline,
        description: c.description,
        call_to_action: {
          type: "GET_QUOTE",
          value: { link },
        },
      },
    };

    const creative = await api("POST", `${ACCT}/adcreatives`, {
      name: `Creative · FS · ${c.slug} · ${stamp}`,
      object_story_spec: JSON.stringify(storySpec),
      degrees_of_freedom_spec: JSON.stringify({
        creative_features_spec: {
          standard_enhancements: { enroll_status: "OPT_OUT" },
        },
      }),
    });

    const adName = `Ad · FS · ${c.slug} · ${stamp}`;
    const ad = await api("POST", `${ACCT}/ads`, {
      name: adName,
      adset_id: adset.id,
      creative: JSON.stringify({ creative_id: creative.id }),
      status: "PAUSED",
    });

    journal.ads.push({
      id: ad.id,
      name: adName,
      creative_id: creative.id,
      slug: c.slug,
      link,
    });
    console.log("Ad", ad.id, adName);
  }

  // Activate campaign + ad set + ads (unless --paused)
  if (status === "ACTIVE") {
    await api("POST", camp.id, { status: "ACTIVE" });
    await api("POST", adset.id, { status: "ACTIVE" });
    for (const a of journal.ads) {
      await api("POST", a.id, { status: "ACTIVE" });
    }
    console.log("\n✓ Activated campaign, ad set, and", journal.ads.length, "ads");
  } else {
    console.log("\n✓ Created PAUSED (campaign / ad set / ads). Turn on in Ads Manager when ready.");
  }

  // Verify budget cap
  const after = await sumActiveDailyBudgetCents();
  console.log(
    `Active daily budget now: $${(after.total / 100).toFixed(2)} (cap $${MAX_DAILY_USD})`,
  );
  if (after.total / 100 > MAX_DAILY_USD + 0.01) {
    console.error("ERROR: over cap after launch — pausing new ad set");
    await api("POST", adset.id, { status: "PAUSED" });
  }

  const outDir = join(ROOT, "output", "meta-launches");
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, `fs-trust-${stamp}.json`);
  writeFileSync(outPath, JSON.stringify(journal, null, 2));
  console.log("Journal:", outPath);
  console.log(
    `Ads Manager: https://adsmanager.facebook.com/adsmanager/manage/campaigns?act=${ACCT_RAW}`,
  );
}

main().catch((e) => {
  console.error("LAUNCH_FAILED", e.message || e);
  process.exit(1);
});
