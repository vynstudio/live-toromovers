# Central Florida Moving Checklist — lead-magnet funnel

A self-contained funnel that captures leads with a free moving checklist, delivers
it instantly, and hands the lead to n8n for a nurture sequence.

## Pages

| Route | Index? | Purpose |
|---|---|---|
| `/central-florida-moving-checklist` | **indexable** | Lead-magnet landing page + capture form |
| `/thank-you-checklist` | noindex | Delivery confirmation + quote/call CTAs + PDF download |
| `/quote-prep` | noindex | Friction-reducer before `/quote` |
| `/checklist` | noindex | Existing interactive (printable) checklist — reused |
| `/quote` | (existing) | Multi-step quote wizard |

The lead magnet asset lives at `/public/central-florida-moving-checklist.pdf`
(2-page branded PDF). Regenerate it with:

```bash
node scripts/gen-checklist-pdf.mjs
```

## Data flow

```
Form (/central-florida-moving-checklist)
   └─ POST /api/lead-magnet
        ├─ Resend  → checklist email to the customer (PDF + web links + 1 tip + quote CTA)
        ├─ Resend  → internal lead alert (LEAD_NOTIFICATION_EMAIL)
        ├─ Telegram→ internal lead alert
        ├─ OpenPhone (Quo) → SMS with PDF link  [only if smsOptIn + phone]
        ├─ Meta CAPI → Lead (event_id shared with the browser Pixel for dedupe)
        ├─ HubSpot → upsert contact by email (city, move type, source on the note)
        └─ n8n webhook → starts the 5-email + 3-SMS drip   [if N8N_LEAD_WEBHOOK_URL set]
   → redirect /thank-you-checklist
```

Instant delivery is **native** (reuses the same Resend/OpenPhone/HubSpot/CAPI code
as `/api/booking`). n8n only owns the scheduled follow-up, so the magnet is still
delivered even if n8n is down or unconfigured.

## Tracking events (GA4 + Meta Pixel; Lead also via server CAPI)

| Event | Where it fires |
|---|---|
| `lead_magnet_view` | LP mount (`LeadMagnetForm`) |
| `lead_magnet_submit` + `Lead` | On successful form submit (deduped with CAPI via `eventId`) |
| `thank_you_view` + `CompleteRegistration` | `/thank-you-checklist` mount |
| `pdf_download` | PDF button click (LP + thank-you) |
| `quote_click` / `phone_click` | Already handled globally by `ClickTracking` |

## Environment variables

All but the last two already exist for the quote funnel.

| Var | Used for |
|---|---|
| `RESEND_API_KEY` | Customer + team emails |
| `RESEND_FROM_EMAIL` | From address (default `hello@toromovers.net`) |
| `LEAD_NOTIFICATION_EMAIL` | Internal alert recipient (falls back to `BOOKING_NOTIFICATION_EMAIL`) |
| `OPENPHONE_API_KEY` / `OPENPHONE_FROM_NUMBER` | SMS delivery (Quo / OpenPhone) |
| `HUBSPOT_TOKEN` | CRM upsert (private app token) |
| `META_ACCESS_TOKEN` / `NEXT_PUBLIC_META_PIXEL_ID` | Meta CAPI + Pixel |
| `NEXT_PUBLIC_GA4_ID` | GA4 |
| `NEXT_PUBLIC_SITE_URL` | Absolute links in emails/SMS/canonical (default `https://toromovers.net`) |
| `TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID` | Internal Telegram alert |
| `N8N_LEAD_WEBHOOK_URL` | **new** — n8n Production webhook URL that starts the drip |
| `N8N_WEBHOOK_SECRET` | **new, optional** — sent as `x-toro-secret`; verify it in n8n |

Set the new vars on Netlify (Site settings → Environment variables). The site
works without them — the drip is simply skipped until `N8N_LEAD_WEBHOOK_URL` is set.

## n8n drip (5 emails + 3 SMS) on Railway

1. In n8n, **Import from File** → `docs/n8n-checklist-funnel.workflow.json`.
2. Set these env vars on the n8n (Railway) service so the HTTP Request nodes
   authenticate: `RESEND_API_KEY`, `OPENPHONE_API_KEY`, `OPENPHONE_FROM_NUMBER`.
3. Activate the workflow, copy the **Webhook** node's Production URL, and set it as
   `N8N_LEAD_WEBHOOK_URL` on Netlify.
4. (Optional) Add an IF node after the Webhook comparing header `x-toro-secret`
   to your `N8N_WEBHOOK_SECRET`, and set the same value on Netlify.

Sequence timing: emails immediate / +2d / +4d / +6d / +8d; SMS (opt-in only)
immediate / +2d / +5d. Edit copy and Wait intervals directly in the nodes.

> Note: this replaces the manual notifi.co follow-up for *this* funnel. The quote
> funnel (`/api/booking`) is unchanged.
