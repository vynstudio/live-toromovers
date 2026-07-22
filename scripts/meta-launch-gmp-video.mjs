#!/usr/bin/env node
/**
 * Launch one Meta campaign → /get-my-price, single video creative only.
 *
 * Env: META_ACCESS_TOKEN, META_AD_ACCOUNT_ID (optional)
 * Video: path arg or VIDEO_PATH env
 */
import { createReadStream, writeFileSync, mkdirSync, statSync } from "node:fs";
import { basename } from "node:path";

const TOKEN = process.env.META_ACCESS_TOKEN;
const ACCT_RAW = process.env.META_AD_ACCOUNT_ID || "971361825561389";
const ACCT = ACCT_RAW.startsWith("act_") ? ACCT_RAW : `act_${ACCT_RAW}`;
const API = "https://graph.facebook.com/v19.0";
const PIXEL = process.env.NEXT_PUBLIC_META_PIXEL_ID || "985575491098437";
const PAGE_ID = process.env.META_PAGE_ID || "722514634274519";
const IG_USER = process.env.META_IG_USER_ID || "17841470412443785";

const VIDEO_PATH =
  process.env.VIDEO_PATH ||
  process.argv[2] ||
  "/Users/vynstudio/Downloads/grok-video-da0fdd2b-c77d-4b7f-8856-34ee2fa0f9d0.mp4";

const DAILY_BUDGET_CENTS = Number(process.env.DAILY_BUDGET_CENTS || 1500); // $15
const STAMP = new Date().toISOString().slice(0, 10);
const LANDING = (() => {
  const p = new URLSearchParams({
    utm_source: "meta",
    utm_medium: "paid_social",
    utm_campaign: `gmp_video_${STAMP.replace(/-/g, "")}`,
    utm_content: "grok_video_sole",
    utm_term: "full_service",
    source: "meta-gmp-video",
  });
  return `https://toromovers.net/get-my-price?${p.toString()}`;
})();

const COPY = {
  primary:
    "Need movers in Central Florida? Get your free quote in under a minute — a team member calls back with availability and clear pricing. No hidden fees. Full-service truck + crew.",
  headline: "Get My Free Quote",
  description: "Toro Movers · Central Florida",
};

if (!TOKEN) {
  console.error("META_ACCESS_TOKEN missing");
  process.exit(1);
}
if (!statSync(VIDEO_PATH).isFile()) {
  console.error("Video not found:", VIDEO_PATH);
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
    res = await fetch(url, { method: "POST", body });
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

/** Multipart video upload to ad account */
async function uploadVideo(filePath) {
  const form = new FormData();
  form.append("access_token", TOKEN);
  form.append("title", `Toro GMP · ${basename(filePath)} · ${STAMP}`);
  form.append("description", "Get my price funnel video creative");
  form.append("name", `toro_gmp_${STAMP}`);
  // Blob from file
  const buf = await import("node:fs/promises").then((fs) => fs.readFile(filePath));
  form.append(
    "source",
    new Blob([buf], { type: "video/mp4" }),
    basename(filePath),
  );
  const res = await fetch(`${API}/${ACCT}/advideos`, {
    method: "POST",
    body: form,
  });
  const data = await res.json();
  if (data.error) {
    throw new Error(
      `upload video: ${data.error.message}${data.error.error_user_msg ? " | " + data.error.error_user_msg : ""}`,
    );
  }
  return data.id;
}

async function waitVideoReady(videoId, maxMs = 180000) {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    const v = await api("GET", videoId, {
      fields: "id,status,title,length,picture",
    });
    const st = v.status?.video_status || v.status || "";
    console.log("  video status:", JSON.stringify(v.status || st));
    if (
      st === "ready" ||
      st === "READY" ||
      v.status?.video_status === "ready" ||
      (typeof v.status === "object" && v.status.video_status === "ready")
    ) {
      return v;
    }
    // Some responses: { status: { video_status: "processing" } }
    if (typeof v.status === "string" && /ready|published/i.test(v.status)) {
      return v;
    }
    await new Promise((r) => setTimeout(r, 5000));
  }
  console.warn("Video still processing — continuing; ad may stay IN_PROCESS until ready");
  return await api("GET", videoId, { fields: "id,status,title,picture" });
}

async function main() {
  console.log("=== GMP video campaign launch ===");
  console.log("Account", ACCT);
  console.log("Video", VIDEO_PATH);
  console.log("Landing", LANDING);
  console.log("Budget", `$${DAILY_BUDGET_CENTS / 100}/day`);

  const acct = await api("GET", ACCT, {
    fields: "name,account_status,balance,currency",
  });
  if (Number(acct.account_status) !== 1) {
    throw new Error("Ad account not ACTIVE: " + acct.account_status);
  }
  console.log("Account OK", acct.name, "balance ~$" + (Number(acct.balance || 0) / 100).toFixed(2));

  console.log("Uploading video…");
  const videoId = await uploadVideo(VIDEO_PATH);
  console.log("Video id", videoId);
  const videoMeta = await waitVideoReady(videoId);
  const thumb = videoMeta.picture || "";

  // Campaign
  const campName = `TM — Get My Price · Video · ${STAMP}`;
  const camp = await api("POST", `${ACCT}/campaigns`, {
    name: campName,
    objective: "OUTCOME_LEADS",
    status: "PAUSED",
    special_ad_categories: JSON.stringify([]),
    is_adset_budget_sharing_enabled: "false",
  });
  console.log("Campaign", camp.id, campName);

  const targeting = {
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
    age_max: 65,
    publisher_platforms: ["facebook", "instagram"],
    // video works on feed + reels + stories
    facebook_positions: ["feed", "story", "reels", "facebook_reels"],
    instagram_positions: ["stream", "story", "reels", "ig_search"],
    device_platforms: ["mobile", "desktop"],
  };

  // Ad set — prefer Lead conversions, fall back LPV / link clicks
  let adset;
  const adsetBase = {
    name: `GMP Video · CFL 45mi · $${DAILY_BUDGET_CENTS / 100}/d · ${STAMP}`,
    campaign_id: camp.id,
    daily_budget: String(DAILY_BUDGET_CENTS),
    billing_event: "IMPRESSIONS",
    bid_strategy: "LOWEST_COST_WITHOUT_CAP",
    status: "PAUSED",
    targeting: JSON.stringify(targeting),
  };

  const attempts = [
    {
      label: "OFFSITE_CONVERSIONS LEAD",
      fields: {
        optimization_goal: "OFFSITE_CONVERSIONS",
        promoted_object: JSON.stringify({
          pixel_id: PIXEL,
          custom_event_type: "LEAD",
        }),
      },
    },
    {
      label: "LANDING_PAGE_VIEWS",
      fields: {
        optimization_goal: "LANDING_PAGE_VIEWS",
        promoted_object: JSON.stringify({ pixel_id: PIXEL }),
      },
    },
    {
      label: "LINK_CLICKS",
      fields: {
        optimization_goal: "LINK_CLICKS",
        promoted_object: JSON.stringify({ page_id: PAGE_ID }),
      },
    },
  ];

  for (const attempt of attempts) {
    try {
      adset = await api("POST", `${ACCT}/adsets`, {
        ...adsetBase,
        name: `GMP Video · ${attempt.label.split(" ")[0]} · CFL 45mi · $${DAILY_BUDGET_CENTS / 100}/d · ${STAMP}`,
        ...attempt.fields,
      });
      console.log("Ad set OK", attempt.label, adset.id);
      break;
    } catch (e) {
      console.warn("Ad set failed", attempt.label, e.message);
    }
  }
  if (!adset?.id) throw new Error("Could not create ad set");

  // Creative — video only
  const videoData = {
    video_id: videoId,
    message: COPY.primary,
    title: COPY.headline,
    link_description: COPY.description,
    call_to_action: {
      type: "GET_QUOTE",
      value: { link: LANDING },
    },
  };
  if (thumb) videoData.image_url = thumb;

  let creative;
  try {
    creative = await api("POST", `${ACCT}/adcreatives`, {
      name: `GMP Video creative · ${STAMP}`,
      object_story_spec: JSON.stringify({
        page_id: PAGE_ID,
        instagram_user_id: IG_USER,
        video_data: videoData,
      }),
    });
  } catch (e) {
    console.warn("Creative with IG user failed, retry page only:", e.message);
    creative = await api("POST", `${ACCT}/adcreatives`, {
      name: `GMP Video creative · page-only · ${STAMP}`,
      object_story_spec: JSON.stringify({
        page_id: PAGE_ID,
        video_data: videoData,
      }),
    });
  }
  console.log("Creative", creative.id);

  const ad = await api("POST", `${ACCT}/ads`, {
    name: `GMP · Video sole · get-my-price · ${STAMP}`,
    adset_id: adset.id,
    creative: JSON.stringify({ creative_id: creative.id }),
    status: "PAUSED",
  });
  console.log("Ad", ad.id);

  // Activate campaign → adset → ad
  await api("POST", camp.id, { status: "ACTIVE" });
  await api("POST", adset.id, { status: "ACTIVE" });
  await api("POST", ad.id, { status: "ACTIVE" });
  console.log("Activated campaign + ad set + ad");

  const out = {
    stamp: STAMP,
    activated: true,
    daily_budget_usd: DAILY_BUDGET_CENTS / 100,
    landing: LANDING,
    video_path: VIDEO_PATH,
    video_id: videoId,
    campaign: { id: camp.id, name: campName },
    adset: { id: adset.id },
    creative: { id: creative.id },
    ad: { id: ad.id, name: `GMP · Video sole · get-my-price · ${STAMP}` },
    pixel: PIXEL,
    page_id: PAGE_ID,
    copy: COPY,
  };

  mkdirSync("output/meta-launches", { recursive: true });
  const outPath = `output/meta-launches/gmp-video-${STAMP}.json`;
  writeFileSync(outPath, JSON.stringify(out, null, 2));
  console.log("Wrote", outPath);
  console.log(JSON.stringify(out, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
