#!/usr/bin/env node
/**
 * Launch Toro Movers CALL NOW ads under $20/day cap.
 * - Uploads cloned creatives
 * - Campaign A: Call-optimized ($12/day) — ASAP calls
 * - Campaign B: Website+pixel with UTMs ($8/day) — full tracking funnel
 * - Leaves labor paused; does not exceed $20 combined active daily budget
 *
 * Env: META_ACCESS_TOKEN, META_AD_ACCOUNT_ID
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { join, basename } from "node:path";

const TOKEN = process.env.META_ACCESS_TOKEN;
const ACCT_RAW = process.env.META_AD_ACCOUNT_ID || "971361825561389";
const ACCT = ACCT_RAW.startsWith("act_") ? ACCT_RAW : `act_${ACCT_RAW}`;
const API = "https://graph.facebook.com/v19.0";
const PIXEL = process.env.NEXT_PUBLIC_META_PIXEL_ID || "985575491098437";
const PAGE_ID = process.env.META_PAGE_ID || "722514634274519";
const IG_USER = process.env.META_IG_USER_ID || "17841470412443785";
const PHONE = "+16896002720";
const PHONE_DISPLAY = "(689) 600-2720";

// Budget split under $20 hard cap
const CALL_BUDGET_CENTS = 1200; // $12 — ASAP calls
const WEB_BUDGET_CENTS = 800; // $8 — UTM + pixel LP

const CLONED =
  process.env.CREATIVE_DIR ||
  "/Users/vynstudio/toro-ads-landing/public/ads/call/cloned";

if (!TOKEN) {
  console.error("META_ACCESS_TOKEN missing");
  process.exit(1);
}

async function api(method, path, fields = {}, isForm = false) {
  const url = `${API}/${path}`;
  let res;
  if (method === "GET") {
    const q = new URLSearchParams({ ...fields, access_token: TOKEN });
    res = await fetch(`${url}?${q}`);
  } else if (isForm) {
    // multipart not used; base64 image upload uses form urlencoded bytes
    const body = new URLSearchParams({ ...fields, access_token: TOKEN });
    res = await fetch(url, { method, body });
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

function utm(content, campaign = "call_fs_20260718") {
  // Always land paid traffic on the main SEO domain (not toromoveit.com).
  const base = "https://toromovers.net/full-service-moving";
  const params = new URLSearchParams({
    utm_source: "meta",
    utm_medium: "paid_social",
    utm_campaign: campaign,
    utm_content: content,
    utm_term: "full_service_call",
  });
  return `${base}?${params.toString()}`;
}

const CREATIVES = [
  {
    file: "call-clone-01-tap-to-call-1080x1350.png",
    slug: "tap_to_call",
    primary:
      "Need movers this week in Central Florida? Tap Call — talk to our family crew now. Full-service, up-front pricing.",
    headline: "Tap to call Toro Movers",
    description: "Family crew · Central Florida",
  },
  {
    file: "call-clone-03-call-us-now-1080x1350.png",
    slug: "call_us_now",
    primary:
      "Free quote in minutes. Tap Call for truck + crew. Orlando, Kissimmee, Clermont & more.",
    headline: "Call us now — free quote",
    description: "No hidden fees",
  },
  {
    file: "call-clone-04-truck-crew-1080x1350.png",
    slug: "truck_crew",
    primary:
      "Truck + crew. Full-service moving done right. Tap Call — family-owned Central Florida movers.",
    headline: "Truck + crew · Call now",
    description: "Full-service movers",
  },
  {
    file: "call-clone-02-need-movers-1080x1350.png",
    slug: "need_movers",
    primary:
      "Moving made simple. Tap Call for a free quote from Toro Movers — we answer.",
    headline: "Need movers? Call now",
    description: "Quote in minutes",
  },
];

async function uploadImage(filePath) {
  const buf = readFileSync(filePath);
  const b64 = buf.toString("base64");
  const data = await api("POST", `${ACCT}/adimages`, {
    bytes: b64,
    name: basename(filePath),
  });
  // response: { images: { filename: { hash, url } } }
  const images = data.images || {};
  const first = Object.values(images)[0];
  if (!first?.hash) throw new Error("No image hash returned: " + JSON.stringify(data).slice(0, 300));
  return first.hash;
}

async function ensurePausedLabor() {
  const sets = await api("GET", `${ACCT}/adsets`, {
    fields: "id,name,status,daily_budget,effective_status",
    limit: "100",
    effective_status: JSON.stringify(["ACTIVE", "PAUSED"]),
  });
  for (const s of sets.data || []) {
    const n = (s.name || "").toLowerCase();
    if (n.includes("labor") && s.effective_status === "ACTIVE") {
      await api("POST", s.id, { status: "PAUSED" });
      console.log("Paused labor ad set", s.id, s.name);
    }
  }
}

async function sumActiveDailyBudgetCents() {
  const sets = await api("GET", `${ACCT}/adsets`, {
    fields: "id,name,daily_budget,effective_status",
    limit: "100",
    effective_status: JSON.stringify(["ACTIVE"]),
  });
  let total = 0;
  for (const s of sets.data || []) total += Number(s.daily_budget || 0);
  return total;
}

async function main() {
  const stamp = new Date().toISOString().slice(0, 10);
  const out = {
    stamp,
    pixel: PIXEL,
    phone: PHONE,
    campaigns: [],
    adsets: [],
    ads: [],
    images: {},
    urls: {},
  };

  console.log("=== Toro CALL ads launch ===");
  console.log("Account", ACCT, "Pixel", PIXEL, "Page", PAGE_ID);

  // Balance check
  const acct = await api("GET", ACCT, {
    fields: "name,account_status,balance,currency",
  });
  const bal = Number(acct.balance || 0) / 100;
  console.log("Balance ~$" + bal.toFixed(2), "status", acct.account_status);
  if (Number(acct.account_status) !== 1) throw new Error("Ad account not ACTIVE");
  if (bal < 15) console.warn("WARNING: low balance — top up soon");

  await ensurePausedLabor();

  // Upload images
  for (const c of CREATIVES) {
    const path = join(CLONED, c.file);
    console.log("Upload", c.file);
    const hash = await uploadImage(path);
    out.images[c.slug] = hash;
    console.log("  hash", hash);
  }

  // --- Campaign CALL (ASAP) ---
  const callCampName = `TM — Call Now FS — ${stamp}`;
  const callCamp = await api("POST", `${ACCT}/campaigns`, {
    name: callCampName,
    objective: "OUTCOME_TRAFFIC",
    status: "PAUSED", // create paused, activate after adsets/ads
    special_ad_categories: JSON.stringify([]),
    is_adset_budget_sharing_enabled: "false",
  });
  out.campaigns.push({ id: callCamp.id, name: callCampName, type: "call" });
  console.log("Campaign CALL", callCamp.id);

  // Geo: Central Florida metros
  const targeting = {
    geo_locations: {
      cities: [
        { key: "2490299", name: "Orlando", radius: 40, distance_unit: "mile" }, // may need radius format
      ],
      location_types: ["home", "recent"],
    },
    age_min: 25,
    age_max: 64,
    // device_platforms mobile preferred for calls
    device_platforms: ["mobile"],
    publisher_platforms: ["facebook", "instagram"],
    facebook_positions: ["feed", "story", "reels"],
    instagram_positions: ["stream", "story", "reels"],
  };

  // Simpler geo that Meta accepts reliably: Florida state + cities by name
  const targetingSimple = {
    geo_locations: {
      regions: [{ key: "3875" }], // Florida
    },
    age_min: 25,
    age_max: 64,
    device_platforms: ["mobile"],
    publisher_platforms: ["facebook", "instagram"],
  };

  // Central Florida zips / cities via custom locations - use radius around Orlando
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
    device_platforms: ["mobile"],
    publisher_platforms: ["facebook", "instagram"],
  };

  // Try QUALITY_CALL ad set first; fall back to LINK_CLICKS
  let callAdset;
  const callAdsetBase = {
    name: `Call · Mobile · Central FL 45mi · $${CALL_BUDGET_CENTS / 100}/d · ${stamp}`,
    campaign_id: callCamp.id,
    daily_budget: String(CALL_BUDGET_CENTS),
    billing_event: "IMPRESSIONS",
    bid_strategy: "LOWEST_COST_WITHOUT_CAP",
    status: "PAUSED",
    targeting: JSON.stringify(targetingOrlando),
  };

  try {
    callAdset = await api("POST", `${ACCT}/adsets`, {
      ...callAdsetBase,
      optimization_goal: "QUALITY_CALL",
      destination_type: "PHONE_CALL",
      promoted_object: JSON.stringify({ page_id: PAGE_ID }),
    });
    console.log("Ad set CALL (QUALITY_CALL)", callAdset.id);
  } catch (e) {
    console.warn("QUALITY_CALL failed, trying LINK_CLICKS:", e.message);
    callAdset = await api("POST", `${ACCT}/adsets`, {
      ...callAdsetBase,
      name: `Call/Link · Mobile · Central FL 45mi · $${CALL_BUDGET_CENTS / 100}/d · ${stamp}`,
      optimization_goal: "LINK_CLICKS",
      promoted_object: JSON.stringify({ page_id: PAGE_ID }),
    });
    console.log("Ad set CALL (LINK_CLICKS)", callAdset.id);
  }
  out.adsets.push({ id: callAdset.id, type: "call", budget_cents: CALL_BUDGET_CENTS });

  // --- Campaign WEB+UTM+PIXEL ---
  const webCampName = `TM — LP+UTM FS Pixel — ${stamp}`;
  const webCamp = await api("POST", `${ACCT}/campaigns`, {
    name: webCampName,
    objective: "OUTCOME_TRAFFIC",
    status: "PAUSED",
    special_ad_categories: JSON.stringify([]),
    is_adset_budget_sharing_enabled: "false",
  });
  out.campaigns.push({ id: webCamp.id, name: webCampName, type: "web_utm" });
  console.log("Campaign WEB", webCamp.id);

  let webAdset;
  try {
    webAdset = await api("POST", `${ACCT}/adsets`, {
      name: `LP UTM · Pixel · Central FL 45mi · $${WEB_BUDGET_CENTS / 100}/d · ${stamp}`,
      campaign_id: webCamp.id,
      daily_budget: String(WEB_BUDGET_CENTS),
      billing_event: "IMPRESSIONS",
      optimization_goal: "LANDING_PAGE_VIEWS",
      bid_strategy: "LOWEST_COST_WITHOUT_CAP",
      status: "PAUSED",
      targeting: JSON.stringify(targetingOrlando),
      promoted_object: JSON.stringify({ page_id: PAGE_ID }),
    });
  } catch (e) {
    console.warn("LPV failed, LINK_CLICKS:", e.message);
    webAdset = await api("POST", `${ACCT}/adsets`, {
      name: `LP UTM · LinkClicks · Central FL 45mi · $${WEB_BUDGET_CENTS / 100}/d · ${stamp}`,
      campaign_id: webCamp.id,
      daily_budget: String(WEB_BUDGET_CENTS),
      billing_event: "IMPRESSIONS",
      optimization_goal: "LINK_CLICKS",
      bid_strategy: "LOWEST_COST_WITHOUT_CAP",
      status: "PAUSED",
      targeting: JSON.stringify(targetingOrlando),
      promoted_object: JSON.stringify({ page_id: PAGE_ID }),
    });
  }
  out.adsets.push({ id: webAdset.id, type: "web", budget_cents: WEB_BUDGET_CENTS });
  console.log("Ad set WEB", webAdset.id);

  // Create ads for each creative
  for (const c of CREATIVES) {
    const hash = out.images[c.slug];
    const land = utm(c.slug);
    out.urls[c.slug] = land;

    // CALL creative
    let callCreative;
    try {
      callCreative = await api("POST", `${ACCT}/adcreatives`, {
        name: `Call creative · ${c.slug} · ${stamp}`,
        object_story_spec: JSON.stringify({
          page_id: PAGE_ID,
          instagram_user_id: IG_USER,
          link_data: {
            message: c.primary,
            name: c.headline,
            description: c.description,
            link: land, // still attach UTM LP for fallback / tracking context
            image_hash: hash,
            call_to_action: {
              type: "CALL_NOW",
              value: {
                link: land,
              },
            },
          },
        }),
      });
    } catch (e) {
      console.warn("CALL_NOW creative fail", c.slug, e.message);
      // fallback GET_QUOTE style with call messaging
      callCreative = await api("POST", `${ACCT}/adcreatives`, {
        name: `Call-msg creative · ${c.slug} · ${stamp}`,
        object_story_spec: JSON.stringify({
          page_id: PAGE_ID,
          instagram_user_id: IG_USER,
          link_data: {
            message: `${c.primary} Call ${PHONE_DISPLAY}`,
            name: c.headline,
            description: `Call ${PHONE_DISPLAY}`,
            link: land,
            image_hash: hash,
            call_to_action: {
              type: "LEARN_MORE",
              value: { link: land },
            },
          },
        }),
      });
    }

    const callAd = await api("POST", `${ACCT}/ads`, {
      name: `CALL · ${c.slug} · ${stamp}`,
      adset_id: callAdset.id,
      creative: JSON.stringify({ creative_id: callCreative.id }),
      status: "PAUSED",
    });
    out.ads.push({ id: callAd.id, creative_id: callCreative.id, type: "call", slug: c.slug });
    console.log("Ad CALL", c.slug, callAd.id);

    // WEB UTM creative — Learn More / Get Quote → pixel LP
    const webCreative = await api("POST", `${ACCT}/adcreatives`, {
      name: `UTM LP creative · ${c.slug} · ${stamp}`,
      object_story_spec: JSON.stringify({
        page_id: PAGE_ID,
        instagram_user_id: IG_USER,
        link_data: {
          message: c.primary,
          name: c.headline,
          description: c.description,
          link: land,
          image_hash: hash,
          call_to_action: {
            type: "LEARN_MORE",
            value: { link: land },
          },
        },
      }),
    });
    const webAd = await api("POST", `${ACCT}/ads`, {
      name: `UTM-LP · ${c.slug} · ${stamp}`,
      adset_id: webAdset.id,
      creative: JSON.stringify({ creative_id: webCreative.id }),
      status: "PAUSED",
    });
    out.ads.push({ id: webAd.id, creative_id: webCreative.id, type: "web", slug: c.slug });
    console.log("Ad WEB", c.slug, webAd.id);
  }

  // Activate if under budget cap
  const before = await sumActiveDailyBudgetCents();
  console.log("Active budget before activate $", before / 100);
  const proposed = before + CALL_BUDGET_CENTS + WEB_BUDGET_CENTS;
  if (proposed > 2000) {
    console.error(
      `Would exceed $20 cap ($${proposed / 100}). Leaving new entities PAUSED.`,
    );
    out.activated = false;
  } else {
    // Activate campaigns + adsets + ads
    for (const c of out.campaigns) {
      await api("POST", c.id, { status: "ACTIVE" });
    }
    for (const s of out.adsets) {
      await api("POST", s.id, { status: "ACTIVE" });
    }
    for (const a of out.ads) {
      await api("POST", a.id, { status: "ACTIVE" });
    }
    out.activated = true;
    console.log("ACTIVATED call + web utm under $20 cap");
  }

  const after = await sumActiveDailyBudgetCents();
  out.active_daily_budget_usd = after / 100;
  out.balance_usd = bal;

  mkdirSync(join(process.cwd(), "output", "meta-launches"), { recursive: true });
  const outPath = join(
    process.cwd(),
    "output",
    "meta-launches",
    `call-launch-${stamp}.json`,
  );
  writeFileSync(outPath, JSON.stringify(out, null, 2));
  console.log("Wrote", outPath);
  console.log(JSON.stringify({ activated: out.activated, budget: out.active_daily_budget_usd, campaigns: out.campaigns, adsets: out.adsets }, null, 2));
}

main().catch((e) => {
  console.error("FATAL", e.message || e);
  process.exit(1);
});
