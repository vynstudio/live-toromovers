#!/usr/bin/env node
/**
 * Daily Meta Ads audit for Toro Movers.
 * Reads META_ACCESS_TOKEN + optional META_AD_ACCOUNT_ID from env.
 * Prints a concise report to stdout (JSON summary + human summary).
 *
 * Usage:
 *   node scripts/meta-daily-audit.mjs
 *   META_AD_ACCOUNT_ID=971361825561389 node scripts/meta-daily-audit.mjs
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const TOKEN = process.env.META_ACCESS_TOKEN;
const PIXEL = process.env.NEXT_PUBLIC_META_PIXEL_ID || "985575491098437";
const ACCT_RAW = process.env.META_AD_ACCOUNT_ID || "971361825561389";
const ACCT = ACCT_RAW.startsWith("act_") ? ACCT_RAW : `act_${ACCT_RAW}`;
const API = "https://graph.facebook.com/v19.0";
/** Hard cap on combined ACTIVE ad-set daily budgets (USD). */
const MAX_DAILY_SPEND_USD = Number(process.env.META_MAX_DAILY_SPEND_USD || 20);
/** Preferred split when we need to rebalance under the cap. */
const FULL_SERVICE_BUDGET_CENTS = Number(
  process.env.META_FULL_SERVICE_BUDGET_CENTS || 1500,
); // $15
const RETARGET_BUDGET_CENTS = Number(
  process.env.META_RETARGET_BUDGET_CENTS || 500,
); // $5

if (!TOKEN) {
  console.error("META_ACCESS_TOKEN missing");
  process.exit(1);
}

async function get(path, params = {}) {
  const q = new URLSearchParams({ ...params, access_token: TOKEN });
  const res = await fetch(`${API}/${path}?${q}`);
  const data = await res.json();
  if (!res.ok) {
    const msg = data?.error?.message || JSON.stringify(data);
    throw new Error(`${res.status} ${path}: ${msg}`);
  }
  return data;
}

async function post(path, fields = {}) {
  const body = new URLSearchParams({ ...fields, access_token: TOKEN });
  const res = await fetch(`${API}/${path}`, { method: "POST", body });
  const data = await res.json();
  if (!res.ok) {
    const msg = data?.error?.message || JSON.stringify(data);
    throw new Error(`${res.status} POST ${path}: ${msg}`);
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
  ]) {
    if (act[k] != null) return { leads: act[k], key: k };
  }
  return { leads: 0, key: null };
}

function sumSpend(rows) {
  return (rows || []).reduce((s, r) => s + Number(r.spend || 0), 0);
}

async function main() {
  const now = new Date().toISOString();
  const report = {
    generated_at: now,
    account: ACCT,
    pixel: PIXEL,
    issues: [],
    ok: [],
  };

  // Token / pixel
  const debug = await get("debug_token", { input_token: TOKEN });
  report.token_valid = debug?.data?.is_valid === true;
  if (!report.token_valid) report.issues.push("Meta access token invalid");

  const pixel = await get(PIXEL, {
    fields: "id,name,is_unavailable,last_fired_time",
  });
  report.pixel_info = pixel;
  if (pixel.is_unavailable) report.issues.push("Pixel marked unavailable");
  else report.ok.push(`Pixel OK · last fired ${pixel.last_fired_time || "unknown"}`);

  // Ad account
  const acct = await get(ACCT, {
    fields: "name,account_status,currency,balance,amount_spent,disable_reason",
  });
  report.account_info = acct;
  const bal = Number(acct.balance || 0) / 100;
  if (bal < 50) report.issues.push(`Low ad account balance ~$${bal.toFixed(2)}`);
  if (Number(acct.account_status) !== 1)
    report.issues.push(`Account status not ACTIVE (${acct.account_status})`);

  // Insights
  const ins7 = (
    await get(`${ACCT}/insights`, {
      date_preset: "last_7d",
      fields:
        "spend,impressions,clicks,ctr,cpc,reach,inline_link_clicks,actions,cost_per_action_type",
      level: "account",
    })
  ).data?.[0];
  const ins30 = (
    await get(`${ACCT}/insights`, {
      date_preset: "last_30d",
      fields:
        "spend,impressions,clicks,ctr,cpc,reach,inline_link_clicks,actions,cost_per_action_type",
      level: "account",
    })
  ).data?.[0];

  function pack(row) {
    if (!row) return null;
    const act = actionsMap(row);
    const { leads, key } = leadCount(act);
    const cpaRow = (row.cost_per_action_type || []).find((x) => x.action_type === key);
    return {
      spend: Number(row.spend || 0),
      impressions: Number(row.impressions || 0),
      clicks: Number(row.clicks || 0),
      ctr: Number(row.ctr || 0),
      cpc: Number(row.cpc || 0),
      link_clicks: Number(row.inline_link_clicks || 0),
      lpv: act.landing_page_view || 0,
      leads,
      lead_key: key,
      cpa: cpaRow ? Number(cpaRow.value) : leads ? Number(row.spend) / leads : null,
    };
  }

  report.insights_7d = pack(ins7);
  report.insights_30d = pack(ins30);

  // Active structure
  const adsets = (
    await get(`${ACCT}/adsets`, {
      fields: "id,name,status,effective_status,daily_budget,campaign_id",
      limit: "50",
      filtering: JSON.stringify([
        {
          field: "effective_status",
          operator: "IN",
          value: ["ACTIVE", "PAUSED", "CAMPAIGN_PAUSED"],
        },
      ]),
    })
  ).data;

  const ads = (
    await get(`${ACCT}/ads`, {
      fields:
        "id,name,status,effective_status,adset_id,creative{link_url,object_story_spec,title,body,call_to_action_type}",
      limit: "50",
      filtering: JSON.stringify([
        {
          field: "effective_status",
          operator: "IN",
          value: ["ACTIVE", "PAUSED"],
        },
      ]),
    })
  ).data;

  const activeAdsets = adsets.filter((s) => s.effective_status === "ACTIVE");
  const activeAds = ads.filter((a) => a.effective_status === "ACTIVE");

  report.active_adsets = activeAdsets.map((s) => ({
    id: s.id,
    name: s.name,
    daily_budget_usd: s.daily_budget ? Number(s.daily_budget) / 100 : null,
  }));
  report.active_ads = activeAds.map((a) => {
    const cr = a.creative || {};
    const oss = cr.object_story_spec || {};
    const ld = oss.link_data || {};
    const vd = oss.video_data || {};
    let link = cr.link_url || ld.link;
    if (!link && vd.call_to_action?.value?.link) link = vd.call_to_action.value.link;
    const blob = `${a.name} ${cr.title || ""} ${link || ""}`.toLowerCase();
    return {
      id: a.id,
      name: a.name,
      link,
      is_labor: blob.includes("labor"),
      is_full:
        /full-service|full service|home moving|apartment|door/.test(blob) &&
        !blob.includes("labor"),
    };
  });

  const laborActive = report.active_ads.filter((a) => a.is_labor);
  const fullActive = report.active_ads.filter((a) => a.is_full);
  if (laborActive.length)
    report.issues.push(
      `${laborActive.length} ACTIVE labor-tagged ad(s) — fights full-service positioning`,
    );
  else report.ok.push("No active labor-primary ads");

  if (!fullActive.length && activeAds.length)
    report.issues.push("No active full-service-tagged ads");
  else if (fullActive.length)
    report.ok.push(`${fullActive.length} active full-service-oriented ad(s)`);

  const laborSets = activeAdsets.filter((s) =>
    /labor/i.test(s.name || ""),
  );
  report.fixes = [];

  // Auto-pause labor ad sets + labor ads (full-service-first policy)
  for (const s of laborSets) {
    await post(s.id, { status: "PAUSED" });
    report.fixes.push(`Paused labor ad set: ${s.name}`);
  }
  for (const a of laborActive) {
    await post(a.id, { status: "PAUSED" });
    report.fixes.push(`Paused labor ad: ${a.name}`);
  }
  if (laborSets.length || laborActive.length) {
    report.issues.push(
      `Paused ${laborSets.length} labor ad set(s) and ${laborActive.length} labor ad(s)`,
    );
  }

  // Destination domains
  const dests = {};
  for (const a of report.active_ads) {
    const d = a.link || "(none)";
    dests[d] = (dests[d] || 0) + 1;
  }
  report.destinations = dests;
  const laborDest = Object.keys(dests).filter((u) =>
    /labor/i.test(u),
  );
  if (laborDest.length)
    report.issues.push(
      `Active ads still land on labor URLs: ${laborDest.join(", ")}`,
    );

  // Daily budget cap ($20 default)
  let totalDailyCents = activeAdsets.reduce(
    (s, x) => s + Number(x.daily_budget || 0),
    0,
  );
  report.total_daily_budget_usd = totalDailyCents / 100;
  report.max_daily_spend_usd = MAX_DAILY_SPEND_USD;

  if (totalDailyCents / 100 > MAX_DAILY_SPEND_USD + 0.01) {
    report.issues.push(
      `Daily budget over cap: $${(totalDailyCents / 100).toFixed(2)} > $${MAX_DAILY_SPEND_USD}`,
    );
    // Rebalance known sets: full-service $15 + retarget $5; pause anything else active
    for (const s of activeAdsets) {
      const n = s.name || "";
      if (/labor/i.test(n)) {
        await post(s.id, { status: "PAUSED" });
        report.fixes.push(`Paused over-cap labor set: ${n}`);
        continue;
      }
      if (/full-service|completereg/i.test(n)) {
        await post(s.id, { daily_budget: String(FULL_SERVICE_BUDGET_CENTS) });
        report.fixes.push(
          `Set full-service daily budget to $${FULL_SERVICE_BUDGET_CENTS / 100}`,
        );
        continue;
      }
      if (/retarget/i.test(n)) {
        await post(s.id, { daily_budget: String(RETARGET_BUDGET_CENTS) });
        report.fixes.push(
          `Set retarget daily budget to $${RETARGET_BUDGET_CENTS / 100}`,
        );
        continue;
      }
      // Unknown active sets — pause to protect cap
      await post(s.id, { status: "PAUSED" });
      report.fixes.push(`Paused extra ad set to enforce $${MAX_DAILY_SPEND_USD} cap: ${n}`);
    }
    // Refresh total after fixes
    const refreshed = (
      await get(`${ACCT}/adsets`, {
        fields: "id,name,status,effective_status,daily_budget",
        limit: "50",
        filtering: JSON.stringify([
          {
            field: "effective_status",
            operator: "IN",
            value: ["ACTIVE"],
          },
        ]),
      })
    ).data;
    totalDailyCents = (refreshed || []).reduce(
      (s, x) => s + Number(x.daily_budget || 0),
      0,
    );
    report.total_daily_budget_usd_after = totalDailyCents / 100;
    report.active_adsets_after = (refreshed || []).map((s) => ({
      name: s.name,
      daily_budget_usd: Number(s.daily_budget || 0) / 100,
    }));
  } else {
    report.ok.push(
      `Daily budget under cap: $${(totalDailyCents / 100).toFixed(2)} / $${MAX_DAILY_SPEND_USD}`,
    );
  }

  // Performance flags
  if (report.insights_7d?.cpa != null && report.insights_7d.cpa > 40)
    report.issues.push(
      `7d CPA high: $${report.insights_7d.cpa.toFixed(2)} (leads=${report.insights_7d.leads})`,
    );
  if (report.insights_7d?.ctr != null && report.insights_7d.ctr < 1)
    report.issues.push(`7d CTR low: ${report.insights_7d.ctr.toFixed(2)}%`);
  if (report.insights_7d?.spend > 0 && report.insights_7d?.leads === 0)
    report.issues.push("7d spend with zero Meta leads");

  // Persist
  const outDir = join(process.cwd(), "output", "meta-audits");
  mkdirSync(outDir, { recursive: true });
  const day = now.slice(0, 10);
  const path = join(outDir, `meta-audit-${day}.json`);
  writeFileSync(path, JSON.stringify(report, null, 2));

  // Human summary
  console.log(`\n=== Toro Meta daily audit · ${day} ===`);
  console.log(`Account: ${acct.name || ACCT} · balance ~$${(Number(acct.balance || 0) / 100).toFixed(2)}`);
  console.log(`Pixel: ${pixel.name} · last fire ${pixel.last_fired_time || "n/a"}`);
  console.log(
    `Daily budget cap: $${MAX_DAILY_SPEND_USD} · current active: $${(report.total_daily_budget_usd_after ?? report.total_daily_budget_usd).toFixed(2)}`,
  );
  if (report.insights_7d) {
    const i = report.insights_7d;
    console.log(
      `7d: $${i.spend.toFixed(2)} · ${i.impressions} impr · ${i.clicks} clicks · CTR ${i.ctr.toFixed(2)}% · CPC $${i.cpc.toFixed(2)} · leads ${i.leads} · CPA ${i.cpa != null ? "$" + i.cpa.toFixed(2) : "n/a"}`,
    );
  }
  if (report.insights_30d) {
    const i = report.insights_30d;
    console.log(
      `30d: $${i.spend.toFixed(2)} · leads ${i.leads} · CPA ${i.cpa != null ? "$" + i.cpa.toFixed(2) : "n/a"}`,
    );
  }
  console.log(`Active ad sets: ${activeAdsets.length} · Active ads: ${activeAds.length}`);
  console.log("Destinations:", dests);
  console.log("OK:");
  for (const x of report.ok) console.log("  ✓", x);
  console.log("Fixes:");
  if (!report.fixes.length) console.log("  (none)");
  for (const x of report.fixes) console.log("  →", x);
  console.log("Issues:");
  if (!report.issues.length) console.log("  (none)");
  for (const x of report.issues) console.log("  ✗", x);
  console.log(`Wrote ${path}`);
  console.log(
    JSON.stringify({
      issues: report.issues,
      fixes: report.fixes,
      ok: report.ok,
      total_daily_budget_usd: report.total_daily_budget_usd_after ?? report.total_daily_budget_usd,
      max_daily_spend_usd: MAX_DAILY_SPEND_USD,
      insights_7d: report.insights_7d,
    }),
  );
}

main().catch((e) => {
  console.error("AUDIT_FAILED", e.message || e);
  process.exit(1);
});
