# Toro Movers — Stage SMS follow-up plan (HubSpot + OpenPhone + Resend)

**Stack:** HubSpot Mudanzas · OpenPhone/Quo SMS · Resend email · Telegram · n8n (delays)  
**Pipeline CRM** (`crm.toromovers.net`) is on hold — this doc is the **main site** automation.

Review link: `https://g.page/r/CYAKurQHh5TvEAI/review`  
**Book online (pre-book stages):** `https://toromovers.net/get-my-price?src=sms&step=<stepId>`  
(Spanish: `/es/get-my-price?src=sms&step=…`)

Pre-book SMS/email (New Lead → Quote Sent) always include the book link.  
Booked / Move Done / Review stages do **not** re-push the funnel.

---

## SMS count per stage

| Stage (HubSpot) | SMS # | When |
|-----------------|------:|------|
| **New Lead** | **4** | Instant · +1h · +24h · +72h |
| **No Answer** | **3** | Instant · +4h · +24h |
| **Contacted** | **2** | Instant · +24h |
| **Quote Sent** | **3** | Instant · +24h · +48h |
| **Booked** | **2** | Instant · eve-of-move (n8n / move date) |
| **Move Done** | **1** | Instant (Google review) |
| **Review Sent** | **1** | Instant nudge |
| **Review Got** | **0** | — |

**Total theoretical max** if a lead walks every stage without cancel: **16 SMS** (real journeys are fewer because later stages cancel earlier delayed steps).

---

## What fires where

| Trigger | Instant | Delayed |
|---------|---------|---------|
| New web / CRM lead (`intakeLead`) | `new_0` SMS+email | n8n: `new_1h`, `new_24h`, `new_72h` |
| Telegram / API stage change | That stage’s `*_0` step | n8n: remaining delays for that stage |
| n8n Wait done | — | `POST /api/crm/sequences/stage-run` |

Cancel rule: delayed steps should **not** send if HubSpot stage has already moved forward (n8n IF / HubSpot get deal).

---

## APIs

```http
GET  https://toromovers.net/api/crm/sequences/plan
```

```http
POST https://toromovers.net/api/crm/sequences/stage-run
x-lead-secret: $LEAD_INTAKE_SECRET
Content-Type: application/json

{
  "stage": "newLead",
  "stepId": "new_1h",
  "firstName": "Maria",
  "phone": "+13215551234",
  "email": "maria@example.com",
  "lang": "en",
  "consentSms": true,
  "consentEmail": true
}
```

```http
POST https://toromovers.net/api/crm/stage
x-lead-secret: $LEAD_INTAKE_SECRET

{
  "email": "maria@example.com",
  "phone": "+13215551234",
  "stage": "quoteSent",
  "firstName": "Maria",
  "consentSms": true
}
```

Response includes `automations[]` and `delayedSteps[]` for n8n.

---

## n8n pattern (per stage change or new lead)

1. Webhook receives `{ event, stage, firstName, phone, email, delayedSteps[] }`  
2. For each item in `delayedSteps`:  
   - Wait `delayMinutes`  
   - Optional: get HubSpot deal stage — if different from `stage`, stop  
   - POST `/api/crm/sequences/stage-run` with that `stepId`  

Import sketch: extend `docs/n8n-crm-drip.workflow.json` or create `stage-sms-drip` from plan JSON.

---

## Code map

| File | Role |
|------|------|
| `src/lib/crm/stage-sms-plan.ts` | Counts, delays, copy |
| `src/lib/crm/run-stage-automation.ts` | Send via OpenPhone + Resend |
| `src/lib/crm/stage.ts` | HubSpot advance + instant SMS |
| `src/lib/crm/intake.ts` | New lead → New Lead step 0 |
| `src/app/api/crm/sequences/stage-run` | Delayed steps |
| `src/app/api/crm/sequences/plan` | Ops JSON of the plan |

---

## Consent

- SMS only if phone + consent (or meta_call / call funnel defaults)  
- Email only if email + consentEmail !== false  
- Always include STOP language on SMS  

---

## Adjusting counts later

Edit `STAGE_SMS_PLANS` in `stage-sms-plan.ts` — add/remove steps and copy in `buildStageStepCopy`. Redeploy site. Update n8n only if new delay IDs appear.
