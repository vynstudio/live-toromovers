# Toro Movers — Funnel Automation Build Report
**Date:** 2026-06-11 · **Repo:** vynstudio/live-toromovers · **Site:** toromovers.net (Netlify)

## Summary
The two high-intent lead funnels (labor-only + full-service) and the checklist
magnet are fully wired end-to-end: instant delivery + n8n nurture drip + CRM +
tracking. All verified live in production.

## What shipped (this engagement)
- **Funnels live:** `/labor-only-moving`, `/full-service-moving`, `/central-florida-moving-checklist` (+ their thank-you pages). Dark/bold design, 4-step ~30s wizard, FAQ + schema, sticky mobile CTA.
- **Automation wired:** site → n8n webhook → email/SMS drip, with HubSpot, Resend, OpenPhone/Quo, Meta CAPI, GA4/Pixel, Telegram.

## Live wiring status — all green
| Component | Status |
|---|---|
| n8n workflows (funnel + checklist) | ✅ imported + active (2 only, no dupes) |
| Webhooks registered | ✅ `/webhook/toro-funnel-lead`, `/webhook/toro-checklist-lead` |
| Netlify env vars (N8N_* + HUBSPOT_TOKEN) | ✅ set + deployed |
| Instant SMS to customer (OpenPhone) | ✅ live-tested to 321-758-0094 |
| Instant customer email + team alert (Resend) | ✅ delivered |
| HubSpot contact upsert | ✅ fixed (token was missing in Netlify) |
| Meta CAPI Lead | ✅ |
| Drip emails (Resend, 5-step) | ✅ Email 1 delivered (verified in Resend) |
| Drip SMS (OpenPhone, 3-step) | ✅ same branch / credential |

## Key technical decisions
- **Reliability:** webhook calls hard-capped at 2.5s (AbortSignal) — a slow/down n8n never delays the thank-you page. Fail-soft throughout.
- **Security:** drip auth uses **encrypted n8n credentials** (Resend + OpenPhone), NOT `$env`. We deliberately did **not** set `N8N_BLOCK_ENV_ACCESS_IN_NODE=false` — on this multi-tenant n8n it would have exposed every client's secrets. No secrets in Railway env or workflow JSON.
- **HubSpot finding:** `HUBSPOT_TOKEN` had never been set in Netlify, so leads were not reaching the CRM. Now fixed — contacts upsert by email, routed by funnel (note carries funnel_type, service, UTMs, timestamp).

## Tracking events live
funnel_view · form_start · form_step_complete · form_submit · funnel_submit · lead_magnet_submit · thank_you_view · quote_click · phone_click · text_click · pdf_download (GA4 + Meta Pixel; Lead also via server CAPI, deduped by event_id).

## Follow-up / housekeeping
- **Rotate the temporary tokens** shared during wiring: Railway token, n8n API key (`toro-wiring`), Netlify PAT. (HubSpot/Resend/OpenPhone keys are stored correctly and need no rotation.)
- Optional: create HubSpot custom properties (funnel_type, service_type, utm_*) and map them in the n8n HubSpot node for structured columns (today they land in the contact note). Steps in `docs/wiring-runbook.md`.
- n8n does not persist successful executions (only errors) — verification is via Resend/OpenPhone logs, which is expected.

## Reference
- Runbook: `docs/wiring-runbook.md`
- Workflows: `docs/n8n-funnel.workflow.json`, `docs/n8n-checklist-funnel.workflow.json`
- Tooling: `scripts/n8n-deploy.mjs`, `scripts/wire-netlify.mjs`, `scripts/n8n-credentials-rewire.mjs`, `scripts/test-webhooks.mjs`
