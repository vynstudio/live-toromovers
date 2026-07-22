# Toro Movers — CRM & Client Automation

Stack: **HubSpot** (CRM) · **Resend** (email) · **OpenPhone / Quo** (SMS) · **Telegram** (internal) · **n8n** (drip waits, optional)

This system lives in `toromovers-site` so funnels, booking, and CRM share the same env and pipeline.

---

## Architecture

```
┌──────────────────┐     ┌─────────────────────────────┐
│ Website funnels  │────▶│ Existing /api/funnel-lead   │
│ Checklist        │     │ /api/lead-magnet            │
│ Booking          │     └─────────────┬───────────────┘
└──────────────────┘                   │
                                       ▼
┌──────────────────┐     ┌─────────────────────────────┐
│ Meta Call Now /  │────▶│ POST /api/crm/lead          │◀── manual / Zapier
│ Internal log     │     │  (unified intake)           │
└──────────────────┘     └─────────────┬───────────────┘
                                       │
               ┌───────────────────────┼───────────────────────┐
               ▼                       ▼                       ▼
        ┌────────────┐          ┌────────────┐          ┌────────────┐
        │  HubSpot   │          │ Telegram   │          │   Resend   │
        │ Contact +  │          │ + stage    │          │  customer  │
        │ Mudanzas   │          │  buttons   │          │  + team    │
        │ Deal       │          └────────────┘          └────────────┘
        └─────┬──────┘                                          │
              │                                         ┌───────┴───────┐
              │                                         │  OpenPhone    │
              │                                         │  confirm SMS  │
              │                                         └───────────────┘
              ▼
     Pipeline stages
     New → Attempted → Contacted → Quote → Booked → Done → Review
              ▲
              │
   ┌──────────┴──────────┐
   │ Telegram buttons    │  GET  /api/crm/stage?e=&s=
   │ OpenPhone inbound   │  POST /api/crm/webhooks/openphone
   │ n8n / manual        │  POST /api/crm/stage
   └─────────────────────┘

Drip (n8n Wait or cron):
   POST /api/crm/sequences/run
     followup_1h → followup_24h → followup_72h
     booked_confirm · move_day_eve · post_move_review
```

---

## API map

| Route | Auth | Purpose |
|-------|------|---------|
| `POST /api/crm/lead` | public (rate limit) or `x-lead-secret` | Unified lead → HubSpot + TG + Resend + SMS |
| `GET/POST /api/crm/stage` | secret on POST; GET for Telegram links | Advance deal stage |
| `POST /api/crm/webhooks/openphone` | optional `x-openphone-secret` | Inbound SMS → Contacted |
| `POST /api/crm/sequences/run` | `x-lead-secret` or `x-toro-secret` | Fire drip email/SMS step |
| `POST /api/funnel-lead` | public | Labor / full-service (existing) |
| `POST /api/lead-magnet` | public | Checklist (existing) |
| `POST /api/review-request` | `x-lead-secret` | Post-move Google review (existing) |

### Log a Call Now lead (internal)

```bash
curl -X POST https://toromovers.net/api/crm/lead \
  -H "Content-Type: application/json" \
  -H "x-lead-secret: $LEAD_INTAKE_SECRET" \
  -d '{
    "name": "Maria G",
    "phone": "6896002720",
    "funnel": "call",
    "source": "meta_call",
    "city": "Orlando",
    "serviceType": "Full-service",
    "note": "Called from Meta ad fullservice",
    "consentSms": true
  }'
```

Phone-only leads upsert HubSpot by **phone** (E.164) and open a **Mudanzas** deal in **New Lead**.

### Advance stage

```bash
# Telegram-style
curl "https://toromovers.net/api/crm/stage?e=client@email.com&s=c"

# Codes: a=no answer · c=contacted · q=quote · b=booked · m=move done · r=review sent · o=review got
```

### Run a sequence step

```bash
curl -X POST https://toromovers.net/api/crm/sequences/run \
  -H "Content-Type: application/json" \
  -H "x-lead-secret: $LEAD_INTAKE_SECRET" \
  -d '{
    "sequence": "followup_24h",
    "firstName": "Maria",
    "email": "maria@example.com",
    "phone": "+16895550100",
    "lang": "en",
    "funnel": "full-service",
    "channels": ["email", "sms"]
  }'
```

Sequences: `call_instant` · `followup_1h` · `followup_24h` · `followup_72h` · `booked_confirm` · `move_day_eve` · `post_move_review` · `nurture_checklist`

---

## Environment variables (Netlify)

| Variable | Channel |
|----------|---------|
| `HUBSPOT_TOKEN` | CRM private app |
| `RESEND_API_KEY` | Email |
| `RESEND_FROM_EMAIL` | e.g. `hello@toromovers.net` |
| `LEAD_NOTIFICATION_EMAIL` | Team alert inbox |
| `OPENPHONE_API_KEY` or `QUO_API_KEY` | SMS |
| `OPENPHONE_FROM_NUMBER` or `QUO_FROM_NUMBER` | E.164 e.g. `+16896002720` |
| `TELEGRAM_BOT_TOKEN` | Internal alerts |
| `TELEGRAM_CHAT_ID` | Group/user id |
| `LEAD_INTAKE_SECRET` | Internal API auth |
| `N8N_FUNNEL_WEBHOOK_URL` | Optional drip |
| `N8N_WEBHOOK_SECRET` | Optional shared secret |
| `OPENPHONE_WEBHOOK_SECRET` | Optional inbound webhook auth |
| `GOOGLE_REVIEW_URL` | Review asks |
| `NEXT_PUBLIC_SITE_URL` | `https://toromovers.net` |

HubSpot pipeline IDs are already in `src/lib/hubspot.ts` (`Mudanzas`). Re-run:

```bash
node scripts/hubspot-setup.mjs   # needs .env.wire with HUBSPOT_TOKEN
```

---

## Client automation playbook

| When | Action | How |
|------|--------|-----|
| New web lead | Instant email + SMS + TG + HubSpot | `/api/funnel-lead` (live) |
| Meta Call Now | Log phone lead → CRM + TG + optional SMS | `/api/crm/lead` + `source: meta_call` |
| No answer | Stage → Attempted | Telegram **No Answer** |
| Customer texts back | Stage → Contacted | OpenPhone webhook |
| Quote sent | Stage → Quote | Telegram button |
| Booked | Stage → Booked + `booked_confirm` sequence | Button + `/sequences/run` |
| Night before move | `move_day_eve` | n8n schedule / manual |
| Move done | Stage → Completed + `post_move_review` | Button + `/api/review-request` |

### Recommended n8n drip (after `/api/crm/lead` or funnel)

1. Webhook receive lead  
2. Wait **1h** → `POST /api/crm/sequences/run` `followup_1h`  
3. Wait **23h** → `followup_24h`  
4. Wait **48h** → `followup_72h`  
5. Stop if deal stage ≥ Contacted / Booked (HubSpot IF)

Import existing funnels from:
- `docs/n8n-funnel.workflow.json`
- `docs/n8n-checklist-funnel.workflow.json`
- `docs/n8n-telegram-stage.workflow.json`
- `docs/n8n-sms-stage.workflow.json`

Point Telegram stage URLs at **site** `/api/crm/stage` if you want stage moves without n8n:

```
https://toromovers.net/api/crm/stage?e={{email}}&s=c
```

(Or keep Railway n8n hook already set in `telegramStageKeyboard`.)

---

## OpenPhone (Quo) webhook

1. OpenPhone / Quo → **Settings → Webhooks**  
2. Event: **message.received**  
3. URL: `https://toromovers.net/api/crm/webhooks/openphone`  
4. Optional header secret → `OPENPHONE_WEBHOOK_SECRET`

Contacts **must** store phone in **E.164** (`+1689…`) so inbound matches — `intake` + funnel routes already normalize.

---

## Code map

```
src/lib/crm/
  types.ts        Funnel, stages, sequences
  providers.ts    Resend · OpenPhone · Telegram · HubSpot HTTP
  sequences.ts    EN/ES email + SMS copy
  intake.ts       Unified lead orchestration
  stage.ts        Deal stage advance
  index.ts

src/app/api/crm/
  lead/route.ts
  stage/route.ts
  webhooks/openphone/route.ts
  sequences/run/route.ts

src/lib/hubspot.ts   Pipeline IDs + upsertLeadToHubspot + Telegram keyboard
scripts/hubspot-setup.mjs
```

---

## Acceptance checklist

- [ ] Env vars set on Netlify + redeploy  
- [ ] Submit full-service funnel → HubSpot deal New Lead + TG + Resend + SMS  
- [ ] `POST /api/crm/lead` phone-only → HubSpot contact by phone  
- [ ] Telegram **Contacted** advances deal  
- [ ] Inbound SMS advances to Contacted + TG alert  
- [ ] `sequences/run` followup_24h sends email/SMS  
- [ ] Move Done → review-request SMS  

---

## Note on Call Now ads

Meta Call Now does **not** send a server webhook with the caller’s number to your site. Operational options:

1. **Manual / VoIP log** — after a call, log via `/api/crm/lead` with `source: meta_call`  
2. **OpenPhone call summary** — if Quo fires call.completed webhooks, extend `webhooks/openphone`  
3. **Form + Call** — keep Call Now for intent; retarget engagers with Get Quote  

Phone **(689) 600-2720** is the brand number used across sequences.
