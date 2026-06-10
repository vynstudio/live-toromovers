// End-to-end proof that each funnel fires the right n8n webhook with the right
// branch + fields — WITHOUT a real n8n, HubSpot, or any keys.
//
// It (1) starts a throwaway "fake n8n" HTTP listener, (2) boots an isolated
// `next dev` whose N8N_*_WEBHOOK_URL point at that listener, (3) submits all
// three funnels to the real API routes, (4) asserts the captured payloads.
//
//   node scripts/test-webhooks.mjs
//
// Exit code 0 = all assertions passed.

import http from "node:http";
import { spawn } from "node:child_process";

const FAKE_PORT = 9899;
const DEV_PORT = 3099;
const BASE = `http://localhost:${DEV_PORT}`;
const captured = [];

// 1) fake n8n — records every POST and replies 200 fast
const listener = http.createServer((req, res) => {
  let body = "";
  req.on("data", (c) => (body += c));
  req.on("end", () => {
    let json = null;
    try { json = JSON.parse(body); } catch {}
    captured.push({ path: req.url, secret: req.headers["x-toro-secret"] || null, json });
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(`{"ok":true}`);
  });
});
await new Promise((r) => listener.listen(FAKE_PORT, r));
console.log(`fake n8n listening on :${FAKE_PORT}`);

// 2) isolated next dev with webhook envs injected
const dev = spawn("npm", ["run", "dev", "--", "-p", String(DEV_PORT)], {
  cwd: process.cwd(),
  env: {
    ...process.env,
    N8N_FUNNEL_WEBHOOK_URL: `http://localhost:${FAKE_PORT}/webhook/toro-funnel-lead`,
    N8N_LEAD_WEBHOOK_URL: `http://localhost:${FAKE_PORT}/webhook/toro-checklist-lead`,
    N8N_WEBHOOK_SECRET: "test-secret-123",
  },
  stdio: "ignore",
});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function waitReady() {
  for (let i = 0; i < 90; i++) {
    try {
      // hitting the route compiles it; 400 (validation) means it's alive
      const r = await fetch(`${BASE}/api/funnel-lead`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: "{}",
      });
      if (r.status === 400 || r.status === 200) return true;
    } catch {}
    await sleep(1000);
  }
  return false;
}

function assert(cond, msg) {
  if (!cond) { console.error("  ✗ " + msg); process.exitCode = 1; }
  else console.log("  ✓ " + msg);
}

try {
  console.log("booting isolated dev server…");
  if (!(await waitReady())) throw new Error("dev server did not become ready");

  const submit = (path, payload) =>
    fetch(`${BASE}${path}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, elapsedMs: 9000 }),
    }).then((r) => r.json());

  // 3) submit all three funnels
  const labor = await submit("/api/funnel-lead", {
    funnel: "labor", firstName: "Labor", email: "labor@test.com", phone: "(689) 600-2720",
    moveDate: "This week", city: "Orlando", helpNeeded: ["Both"], smsConsent: true,
    utm: { utm_source: "facebook", utm_medium: "cpc", utm_campaign: "labor-test" },
    landingPage: "/labor-only-moving",
  });
  const full = await submit("/api/funnel-lead", {
    funnel: "full-service", firstName: "Full", email: "full@test.com", phone: "(689) 600-2720",
    moveDate: "This month", city: "Kissimmee", propertyType: "House", packingHelp: true, smsConsent: false,
    utm: { utm_source: "google", utm_medium: "cpc", utm_campaign: "fs-test" },
    landingPage: "/full-service-moving",
  });
  const checklist = await submit("/api/lead-magnet", {
    firstName: "Check", email: "check@test.com", phone: "(689) 600-2720",
    city: "Lake Mary", moveType: "apartment", smsOptIn: true,
    utm: { utm_source: "newsletter" }, landingPage: "/central-florida-moving-checklist",
  });

  await sleep(400); // let the fire-and-forget webhooks land

  console.log("\nAPI responses (drip flag = webhook reached fake n8n):");
  console.log("  labor:", JSON.stringify(labor));
  console.log("  full :", JSON.stringify(full));
  console.log("  check:", JSON.stringify(checklist));

  // 4) assertions
  const byPath = (p) => captured.filter((c) => c.path === p);
  const funnelCalls = byPath("/webhook/toro-funnel-lead");
  const checkCalls = byPath("/webhook/toro-checklist-lead");

  console.log("\nAssertions:");
  assert(funnelCalls.length === 2, "funnel webhook hit twice (labor + full-service)");
  assert(checkCalls.length === 1, "checklist webhook hit once");

  const lc = funnelCalls.find((c) => c.json?.funnel === "labor");
  const fc = funnelCalls.find((c) => c.json?.funnel === "full-service");
  assert(lc, "labor call has funnel=labor (branch routing)");
  assert(fc, "full-service call has funnel=full-service (branch routing)");
  assert(lc?.json?.serviceType?.includes("Both"), "labor serviceType carries help selection");
  assert(lc?.json?.consentSms === true, "labor consentSms=true");
  assert(fc?.json?.consentSms === false, "full-service consentSms=false (no opt-in)");
  assert(fc?.json?.packingHelp === true, "full-service packingHelp forwarded");
  assert(lc?.json?.utm?.utm_source === "facebook", "labor structured utm forwarded");
  assert(lc?.secret === "test-secret-123", "x-toro-secret header forwarded");

  const ck = checkCalls[0];
  assert(ck?.json?.funnel === "checklist", "checklist call has funnel=checklist");
  assert(ck?.json?.consentSms === true, "checklist consentSms from smsOptIn");
  assert(ck?.json?.links?.pdf?.includes(".pdf"), "checklist payload carries PDF link");
  assert(ck?.json?.utm?.utm_source === "newsletter", "checklist structured utm forwarded");

  console.log(process.exitCode ? "\nFAILED" : "\nALL PASSED ✅");
} catch (e) {
  console.error("ERROR:", e.message);
  process.exitCode = 1;
} finally {
  dev.kill("SIGKILL");
  listener.close();
  await sleep(200);
}
