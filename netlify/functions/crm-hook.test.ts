// Local test for the HubSpot CRM webhook function.
//
//   npm run test:crm-hook
//
// Runs on Node's built-in test runner with native TypeScript stripping
// (Node >= 22.18). It stubs global.fetch so no real email/SMS is sent, POSTs a
// sample "Completed" deal payload to the handler, and asserts that BOTH the
// Resend (email) and Quo (SMS) calls fire.

import test from "node:test";
import assert from "node:assert/strict";

// Configure env BEFORE importing the handler's senders read it at call time.
process.env.HUBSPOT_TOKEN = "test-hubspot-token";
process.env.RESEND_API_KEY = "test-resend-key";
process.env.RESEND_FROM_EMAIL = "hello@toromovers.net";
process.env.QUO_API_KEY = "test-quo-key";
process.env.QUO_FROM_NUMBER = "+16896002720";

import handler, { CrmHookSchema } from "./crm-hook.ts";

type Captured = { url: string; init?: RequestInit };

/** Swap in a fetch stub that records calls and returns a 200. */
function stubFetch(): { calls: Captured[]; restore: () => void } {
  const calls: Captured[] = [];
  const original = globalThis.fetch;
  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    calls.push({ url, init });
    return new Response(JSON.stringify({ id: "stub" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }) as typeof fetch;
  return { calls, restore: () => { globalThis.fetch = original; } };
}

function completedPayload() {
  return {
    stage: "completed",
    contact: {
      firstName: "Maria",
      lastName: "Gomez",
      email: "maria@example.com",
      phone: "+14075551234",
      language: "en",
    },
    deal: {
      id: "deal_123",
      quote_amount: 850,
      review_link: "https://g.page/r/toromovers/review",
      move_date: "2026-06-01",
      last_customer_reply: "2026-06-02T15:04:00Z",
    },
  };
}

function request(body: unknown, headers: Record<string, string> = {}) {
  return new Request("https://toromovers.net/.netlify/functions/crm-hook", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${process.env.HUBSPOT_TOKEN}`,
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

test("Completed payload fires BOTH email and SMS", async () => {
  const { calls, restore } = stubFetch();
  try {
    const res = await handler(request(completedPayload()));
    assert.equal(res.status, 200, "handler should return 200");

    const json = (await res.json()) as {
      ok: boolean;
      stage: string;
      template: string;
      sent: { email: boolean; sms: boolean };
    };

    assert.equal(json.ok, true);
    assert.equal(json.stage, "completed");
    assert.equal(json.template, "review_request");
    assert.equal(json.sent.email, true, "email send should report success");
    assert.equal(json.sent.sms, true, "sms send should report success");

    // Both upstream APIs must have been hit exactly once.
    const resend = calls.filter((c) => c.url.includes("api.resend.com"));
    const quo = calls.filter((c) => c.url.includes("openphone.com") || c.url.includes("quo"));
    assert.equal(resend.length, 1, "Resend should be called once");
    assert.equal(quo.length, 1, "Quo SMS should be called once");

    // The SMS body should be the review-request copy.
    const smsBody = JSON.parse(String(quo[0].init?.body));
    assert.match(smsBody.content, /review/i);
    assert.deepEqual(smsBody.to, ["+14075551234"]);
  } finally {
    restore();
  }
});

test("rejects a request with the wrong shared secret", async () => {
  const { restore } = stubFetch();
  try {
    const res = await handler(request(completedPayload(), { authorization: "Bearer nope" }));
    assert.equal(res.status, 401);
  } finally {
    restore();
  }
});

test("invalid payload is rejected with 400", async () => {
  const { calls, restore } = stubFetch();
  try {
    const res = await handler(request({ stage: "completed" })); // missing contact
    assert.equal(res.status, 400);
    assert.equal(calls.length, 0, "no sends on invalid payload");
  } finally {
    restore();
  }
});

test("non-template stages are acknowledged but send nothing", async () => {
  const { calls, restore } = stubFetch();
  try {
    const body = completedPayload();
    body.stage = "new_lead";
    const res = await handler(request(body));
    const json = (await res.json()) as { ok: boolean; skipped: boolean };
    assert.equal(res.status, 200);
    assert.equal(json.skipped, true);
    assert.equal(calls.length, 0, "new_lead should not send");
  } finally {
    restore();
  }
});

test("schema accepts the documented HubSpot payload", () => {
  const parsed = CrmHookSchema.safeParse(completedPayload());
  assert.equal(parsed.success, true);
});
