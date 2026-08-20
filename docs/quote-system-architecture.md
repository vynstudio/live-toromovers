# Toro Movers — Universal Quote / Lead System

**Document:** Phase A architecture (revised)  
**Status:** architecture **accepted**. Global public phone is in `src/config/business.ts`. **Step B (Neon/schema) is blocked** until Neon, HubSpot, and staging Telegram access is in place. No production release until staging QA passes and the owner approves.  
**Revised:** 2026-08-20 (phone + access checklist)  
**Canonical URL:** `https://toromovers.com/get-a-quote`  
**Production API:** `POST /api/v1/leads`  
**Source of truth:** Neon Postgres  
**CRM (required in Phase A):** HubSpot Contact + associated Deal on the existing Mudanzas pipeline  
**Public business number:** `(321) 758-0094` · `tel:+13217580094`

---

## What this revision changes

Owner-approved corrections over the prior draft:

1. **Services** — display the full list (including long-distance, packing help, storage). Configurable in `src/config/quote-form.ts`.
2. **HubSpot is required in Phase A.** Neon remains source of truth. HubSpot is fail-open after Neon insert. Do not defer or remove it.
3. **Production form posts to `POST /api/v1/leads`.** Do not ship the new form permanently to `POST /api/crm/lead`.
4. **Redirect from `/get-my-price` is 302 or 307, not 301,** until live tracking, attribution, conversions, and submissions are verified. Preserve all listed query parameters.
5. **Deployment order A–L is binding.**
6. **Claims lock** applies to every surface, including HubSpot.
7. **Global public number** is `(321) 758-0094` via `src/config/business.ts`. The retired `(689) 600-2720` must not appear as Toro’s callback number. Customer phones in existing leads are never rewritten.

This file is **step A**. Step B starts only after the access checklist in §21 is complete.

---

## Current production truth (do not confuse with preview)

| Surface | Status today |
|---------|----------------|
| Live ad funnel | `https://toromovers.com/get-my-price` (`LeadCaptureAgent`, posts `POST /api/crm/lead`) |
| Live lead path | Telegram crew alert + one OpenPhone/Quo “quote received” SMS. **No Neon. No HubSpot.** HubSpot was removed 2026-07-27 (`src/lib/hubspot.ts` stubs). |
| Local preview | `/get-a-quote` UI exists and currently posts **legacy** `/api/crm/lead`. Preview only. Not production-ready. |
| Ads Final URLs | Still `/get-my-price` (do not change until **step J**) |
| Meta pixel on `/thank-you` | Fires `CompleteRegistration` today. Phase A must fire **`Lead`** with `event_id = lead_id` **after** Neon insert. |

Nothing in this document is live until steps I–L execute.

---

## Claims lock (written confirmation)

Toro Movers is **not currently licensed or insured**.

The quote page, modal, API payloads, Neon records, HubSpot Contact / Deal / Lead / inquiry properties and notes, Telegram alerts, Resend emails, OpenPhone/SMS, Meta Pixel and CAPI events, thank-you page, ads copy, and admin copy **must not** state or imply:

licensed · insured · bonded · certified · authorized · registered · DOT-approved · FMCSA-approved · fully protected · covered for loss or damage · cargo protection · guaranteed protection · moving insurance included · carrier / regulatory authority

Forbidden tokens live in `CLAIMS_FORBIDDEN` in `src/config/quote-form.ts`. QA greps that list against templates before every deploy.

Approved language: request a quote · tell us about your move · talk to our team · check availability · get started · request moving help.

No HubSpot deal name, note, or property default may insert those claims.

---

## Global public phone

Toro Movers’ **only** public / callback number:

| Field | Value | Config |
|-------|--------|--------|
| Display | `(321) 758-0094` | `phoneDisplay` |
| E.164 | `+13217580094` | `phoneE164` |
| Click-to-call | `tel:+13217580094` | `phoneTelHref` |
| Click-to-SMS | `sms:+13217580094` | `phoneSmsHref` |

**Source of truth:** `src/config/business.ts`. `@/lib/contact` re-exports `PHONE_DISPLAY`, `PHONE_TEL`, `PHONE_E164`, `PHONE_SMS_HREF` for existing imports.

Use this number in: header and mobile header, footer, `/get-my-price`, `/get-a-quote`, quote modal, `/thank-you`, `/move-details` (Toro’s number only), contact and service pages, click-to-call and sticky mobile call buttons, Resend emails, OpenPhone/SMS **body** copy, Telegram/internal templates where the callback number appears, HubSpot templates/properties for the company callback number, JSON-LD `telephone`, `public/llms.txt`, and any Meta/ad copy that displays a phone.

**Do not** overwrite customer phone numbers stored on leads. This change is Toro’s own number only.

**Do not** hard-code the number in components. Import from `@/config/business` or `@/lib/contact`.

### Public number vs OpenPhone SMS sender

| Role | Number | Where |
|------|--------|--------|
| Public / callback / click-to-call / JSON-LD / customer-facing copy | `(321) 758-0094` | `phoneDisplay` / `phoneE164` / `phoneTelHref` |
| Customer click-to-SMS on the website | `sms:+13217580094` | `phoneSmsHref` |
| **Outbound confirmation SMS `from`** | `(689) 600-2720` | `OPENPHONE_FROM_NUMBER=+16896002720` |

Keep:

```bash
OPENPHONE_FROM_NUMBER=+16896002720
```

**Do not** set `OPENPHONE_FROM_NUMBER=+13217580094` yet. First confirm `(321) 758-0094` is in OpenPhone/Quo and can send **and** receive SMS. Only after that test passes **and** the migration is approved may the sender change.

Code fallback: `resolveOpenPhoneSmsFrom()` in `src/config/business.ts` uses the env var, then `+16896002720`. It never defaults to 321.

SMS **body** copy that tells the customer how to reach Toro still shows `(321) 758-0094`. The envelope `from` on the OpenPhone API stays `+16896002720`.

Retired as **public display** — QA must not find these in UI, JSON-LD, or click-to-call:

```
6896002720
+16896002720
(689) 600-2720
689-600-2720
```

Allowlist for `+16896002720` / `(689) 600-2720`: `OPENPHONE_FROM_NUMBER`, `openPhoneSmsFromE164`, `.env.example`, and this architecture note. Treat bare `689` / `600` / `2720` as context searches only.

---

## Phase A confirmations (binding)

- All nine approved request types stay enabled and configurable in `REQUEST_TYPES`.
- Neon is the source of truth.
- HubSpot Deal creation on the existing **Mudanzas** pipeline is approved for Phase A.
- Each Deal must associate with the upserted HubSpot Contact (association type 3).
- Use a **307** temporary redirect **only when redirect testing begins**. Do not 301 until Step L.
- Keep `/get-my-price` and `POST /api/crm/lead` as the live production funnel until staging **and** production smoke tests pass.
- Do not send live Meta traffic to `/get-a-quote` until Neon insert, HubSpot sync, Telegram, Resend, OpenPhone/SMS, attribution, thank-you redirect, and Pixel/CAPI dedupe are verified.
- No-claims rule continues on every customer-facing and internal surface.
- No production deployment until the staging checklist passes **and** the owner approves the production release.

---

## Approved services (Step 2)

Configurable in `src/config/quote-form.ts` via `REQUEST_TYPES`: `{ id, label, enabled, order }`.

Enable, disable, rename, or reorder **without rebuilding form markup**. The form renders `REQUEST_TYPES.filter(t => t.enabled).sort((a,b) => a.order - b.order)`. Zod on `POST /api/v1/leads` accepts only currently enabled ids.

Owner-approved display list:

| id | Label | enabled | order |
|----|--------|---------|-------|
| `moving_help` | Moving help | yes | 1 |
| `local_move` | Local move | yes | 2 |
| `long_distance` | Long-distance move | yes | 3 |
| `apartment_move` | Apartment move | yes | 4 |
| `commercial_move` | Commercial move | yes | 5 |
| `packing_help` | Packing help | yes | 6 |
| `storage` | Storage | yes | 7 |
| `other` | Other | yes | 8 |
| `not_sure` | Not sure yet | yes | 9 |

These are **request types**, not legal service-authority claims. Labels must stay claims-safe.

---

## Deployment order (binding)

| Step | Work | Gate |
|------|------|------|
| **A** | This architecture | This file |
| **B** | Neon project, schema, migrations, outbox/retry worker | No HubSpot calls before a Neon insert path exists |
| **C** | `POST /api/v1/leads` — Zod, Turnstile, honeypot, rate limit, idempotency, attribution | New form must not stay on `/api/crm/lead` |
| **D** | HubSpot Contact upsert + inquiry create + retry | Fail-open: never block thank-you |
| **E** | Connect `/get-a-quote` to `POST /api/v1/leads` | |
| **F** | Redirect to `/thank-you` only after Neon returns a valid `lead_id` | Opaque `ref` only — no PII in URL |
| **G** | Meta Pixel + CAPI `Lead` only after successful Neon insert, `event_id = lead_id` | |
| **H** | Staging with **separate** credentials and a **staging Telegram channel** | |
| **I** | Deploy `/get-a-quote` to production | `/get-my-price` remains live until L |
| **J** | Switch Meta Final URLs **after** production smoke confirms inserts, HubSpot sync, notifications, attribution, Meta dedupe | |
| **K** | Rewire all applicable website CTAs to the universal form | |
| **L** | Retire or 301 `/get-my-price` only after the new system is stable | Until then: **302 or 307**, never 301 |

Do not skip, merge, or reorder these steps.

---

## 1. Technical architecture

```
Visitor (ads, organic, CTA, QR, modal, redirect)
        │
        ▼
 UniversalQuoteForm  (/get-a-quote page or later modal)
        │  idempotency_key, Turnstile token, first-touch + last-touch attribution
        ▼
 POST /api/v1/leads
        │
        ├─ 1. Validate (Zod + Turnstile + honeypot + rate limit)
        ├─ 2. INSERT Neon `leads` → UUID lead_id     [COMMIT — required]
        ├─ 3. INSERT Neon `outbox` jobs (pending)    [same transaction]
        └─ 4. HTTP 200 { success: true, lead_id, message }
                │
                ▼  in-process best-effort (short timeout) then outbox worker
        Telegram │ Resend │ OpenPhone/SMS │ HubSpot │ Meta CAPI
                │
                ▼
 GET /thank-you?ref={lead_id}
        Pixel Lead { eventID: lead_id }     // only after insert succeeded
```

### Hard rules

1. **Neon insert is the commit.** If Neon is down → HTTP `503`. User can retry or call. Never fake success.
2. **HubSpot, Telegram, Resend, SMS, and CAPI must not block `200`** once Neon has a `lead_id`.
3. **Never fail a user submission or block `/thank-you` because HubSpot is temporarily unavailable.**
4. Thank-you redirect happens **only after** the client receives a valid `lead_id`.
5. Meta `Lead` (browser + CAPI) fires **only after** Neon insert, with `event_id = lead_id`.
6. Legacy `POST /api/crm/lead` stays for old `/get-my-price` until step L. It is **not** the production destination for the new form.

---

## 2. Platform and hosting

| Item | Value |
|------|--------|
| App | Next.js 16.2.6 App Router, React 19, TypeScript, Zod 4 |
| Host | Netlify `live-toro-site` → `toromovers.com` |
| Database | Neon Postgres (`@neondatabase/serverless` — added in step B) |
| CRM | HubSpot CRM v3, Private App |
| Email | Resend |
| SMS | OpenPhone / Quo |
| Crew alert | Telegram Bot API |
| Bot defense | Cloudflare Turnstile + honeypot + min elapsed + IP rate limit (Netlify Blobs) |
| Outbox worker | Netlify scheduled function every 1 minute |
| Live ad funnel today | `/get-my-price` until J+L |

---

## 3. Neon schema / tables

Database: **Neon Postgres**. Numbered SQL in `src/lib/leads/migrations/`. Run against `DATABASE_URL_UNPOOLED`. App uses pooled `DATABASE_URL`.

Separate Neon **projects** (or branches) for staging and production. Never share a database.

### 3.1 `leads`

Primary row. `id` is the public `lead_id` UUID (also Meta `event_id`).

```sql
CREATE TABLE leads (
  id                              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at_utc                  timestamptz NOT NULL DEFAULT now(),
  updated_at_utc                  timestamptz NOT NULL DEFAULT now(),

  form_version                    text NOT NULL,
  form_name                       text NOT NULL DEFAULT 'universal_quote',
  form_placement                  text NOT NULL,  -- page | modal | embed | other
  lang                            text NOT NULL DEFAULT 'en',
  submission_status               text NOT NULL DEFAULT 'accepted',
  -- accepted | spam_suspected
  lead_status                     text NOT NULL DEFAULT 'new',
  -- new | contacted | quoted | booked | completed | lost | duplicate

  first_name                      text NOT NULL,
  last_name                       text NOT NULL,
  full_name                       text NOT NULL,
  phone                           text,
  phone_normalized_e164           text,
  email                           text,
  email_normalized                text,  -- trim + lower
  preferred_contact_method        text,  -- call | text | email

  request_type                    text NOT NULL,  -- REQUEST_TYPES.id
  move_date                       date,
  move_date_flexibility           text NOT NULL,  -- exact | flexible | unknown
  origin_zip                      text NOT NULL,
  destination_zip                 text NOT NULL,
  move_size                       text,

  pickup_address_line_1           text,
  pickup_address_line_2           text,
  pickup_city                     text,
  pickup_state                    text,
  pickup_postal_code              text,
  pickup_country                  text,
  delivery_address_line_1         text,
  delivery_address_line_2         text,
  delivery_city                   text,
  delivery_state                  text,
  delivery_postal_code            text,
  delivery_country                text,
  pickup_property_type            text,
  delivery_property_type          text,
  pickup_access                   text,
  delivery_access                 text,
  packing_help_needed             text,  -- yes | no | not_sure
  storage_needed                  text,
  special_items                   text[],
  move_notes                      text,
  attachment_urls                 text[] NOT NULL DEFAULT '{}',

  consent_contact                 boolean NOT NULL,
  consent_contact_timestamp_utc   timestamptz,
  consent_contact_text            text,
  consent_marketing               boolean NOT NULL DEFAULT false,
  consent_marketing_timestamp_utc timestamptz,
  consent_marketing_text          text,
  privacy_policy_version          text,
  terms_version                   text,

  lead_source                     text,
  source_type                     text,
  source_detail                   text,
  initial_source                  text,
  initial_landing_page            text,
  landing_page_url                text,
  current_page_url                text,
  referrer_url                    text,

  -- last-touch (submit URL / current click)
  utm_source                      text,
  utm_medium                      text,
  utm_campaign                    text,
  utm_term                        text,
  utm_content                     text,
  gclid                           text,
  gbraid                          text,
  wbraid                          text,
  fbclid                          text,
  msclkid                         text,
  ttclid                          text,
  fbp                             text,  -- _fbp cookie
  fbc                             text,  -- _fbc cookie or constructed from fbclid

  -- first-touch (landing). JSONB keeps the full captured blob.
  first_touch                     jsonb NOT NULL DEFAULT '{}',
  last_touch                      jsonb NOT NULL DEFAULT '{}',
  first_touch_utm_source          text,
  first_touch_utm_medium          text,
  first_touch_utm_campaign        text,

  ad_platform                     text,
  ad_campaign_id                  text,
  ad_group_id                     text,
  ad_id                           text,
  referral_partner                text,
  qr_code_id                      text,
  chat_session_id                 text,
  call_tracking_number            text,
  session_id                      text,
  visitor_id                      text,
  user_ip                         inet,
  user_agent                      text,

  -- HubSpot (required Phase A; fail-open)
  hubspot_contact_id              text,
  hubspot_inquiry_id              text,  -- Deal id (or Lead id if flag = lead)
  hubspot_inquiry_object          text NOT NULL DEFAULT 'deal',  -- deal | lead
  hubspot_sync_status             text NOT NULL DEFAULT 'pending',
  -- pending | syncing | synced | error
  hubspot_retry_count             integer NOT NULL DEFAULT 0,
  hubspot_last_sync_at_utc        timestamptz,
  hubspot_contact_synced_at_utc   timestamptz,
  hubspot_inquiry_synced_at_utc   timestamptz,
  hubspot_last_error              text,

  assigned_to                     text,
  assigned_at_utc                 timestamptz,
  first_contact_attempt_at_utc    timestamptz,
  booked_at_utc                   timestamptz,
  lost_at_utc                     timestamptz,
  lost_reason                     text,
  duplicate_of_lead_id            uuid REFERENCES leads(id),
  spam_score                      numeric,
  spam_flag                       boolean NOT NULL DEFAULT false,
  internal_notes                  text,
  idempotency_key                 text UNIQUE
);

CREATE INDEX leads_email_normalized ON leads (email_normalized);
CREATE INDEX leads_phone_e164 ON leads (phone_normalized_e164);
CREATE INDEX leads_created ON leads (created_at_utc DESC);
CREATE INDEX leads_hubspot_status ON leads (hubspot_sync_status);
CREATE INDEX leads_request_type ON leads (request_type);
```

`updated_at_utc` is maintained by a trigger:

```sql
CREATE OR REPLACE FUNCTION leads_touch_updated_at() RETURNS trigger AS $$
BEGIN NEW.updated_at_utc = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION leads_touch_updated_at();
```

### 3.2 `lead_events`

```sql
CREATE TABLE lead_events (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id         uuid NOT NULL REFERENCES leads(id),
  created_at_utc  timestamptz NOT NULL DEFAULT now(),
  type            text NOT NULL,
  -- submitted | repeat_submission | outbox_sent | outbox_failed
  -- hubspot_contact_upserted | hubspot_inquiry_created | hubspot_error
  -- thank_you_viewed | contact_attempt
  payload         jsonb NOT NULL DEFAULT '{}',
  request_id      text
);

CREATE INDEX lead_events_lead ON lead_events (lead_id, created_at_utc);
```

Do not add extra PII to `payload` beyond what already lives on `leads`.

### 3.3 `lead_files` (created in A; uploads are Phase B)

```sql
CREATE TABLE lead_files (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id         uuid NOT NULL REFERENCES leads(id),
  created_at_utc  timestamptz NOT NULL DEFAULT now(),
  blob_key        text NOT NULL,
  mime            text,
  byte_size       integer,
  original_name   text
);
```

### 3.4 `outbox`

```sql
CREATE TABLE outbox (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id           uuid NOT NULL REFERENCES leads(id),
  job_type          text NOT NULL,
  -- hubspot_contact | hubspot_inquiry | telegram | resend_customer
  -- resend_internal | sms_customer | meta_capi
  status            text NOT NULL DEFAULT 'pending',
  -- pending | processing | sent | failed
  attempts          integer NOT NULL DEFAULT 0,
  max_attempts      integer NOT NULL DEFAULT 8,
  next_attempt_at   timestamptz NOT NULL DEFAULT now(),
  last_error        text,
  payload           jsonb NOT NULL DEFAULT '{}',
  created_at_utc    timestamptz NOT NULL DEFAULT now(),
  sent_at_utc       timestamptz,
  UNIQUE (lead_id, job_type)
);

CREATE INDEX outbox_due ON outbox (status, next_attempt_at);
```

The `(lead_id, job_type)` unique constraint makes retries and in-process + worker races idempotent.

---

## 4. Outbox / retry design

### 4.1 Write path (request handler)

In **one Postgres transaction**:

1. `INSERT INTO leads … RETURNING id`.
2. If same email_normalized **or** same phone_normalized_e164 exists in the last 24 hours, set `duplicate_of_lead_id` (still a new row).
3. Insert outbox rows for:
   - `hubspot_contact`
   - `hubspot_inquiry` (depends on contact id)
   - `telegram`
   - `resend_customer`
   - `resend_internal`
   - `sms_customer` (only if `consent_contact` is true)
   - `meta_capi`
4. Insert `lead_events` type `submitted` (and `repeat_submission` if duplicate).
5. **COMMIT.**
6. Return `200 { success, lead_id, message }` immediately after commit.

Then, **optionally**, try each pending job once in-process with a **2 second** timeout per adapter. Success → `status=sent`, `sent_at_utc=now()`. Failure → leave `pending`. This must never delay the HTTP response beyond a small overall budget (e.g. 2s total, `Promise.allSettled` + `AbortSignal.timeout`). Prefer returning 200 first and letting the worker catch up if in-process work would add latency.

Spam path (`honeypot` filled or `elapsed_ms < 1200`): still insert with `submission_status='spam_suspected'`, `spam_flag=true`. Create outbox jobs **except** `telegram`, `sms_customer`, `resend_customer`, `meta_capi`. HubSpot **is still queued** so the record exists in CRM, tagged spam. Internal Resend may still fire to owner inbox in staging only.

### 4.2 Worker

Netlify scheduled function `process-outbox` every 1 minute (`netlify/functions/process-outbox.mts`).

Claim:

```sql
UPDATE outbox
SET status = 'processing', attempts = attempts + 1
WHERE id IN (
  SELECT id FROM outbox
  WHERE status = 'pending' AND next_attempt_at <= now()
  ORDER BY next_attempt_at
  LIMIT 20
  FOR UPDATE SKIP LOCKED
)
RETURNING *;
```

Backoff after failure: `1m, 5m, 15m, 1h, 6h, 12h, 24h, 24h`.

```
next_attempt_at = now() + backoff[attempts - 1]
status = 'pending'
last_error = truncated (no tokens, no full PII)
```

After `max_attempts`: `status='failed'`. Ping **admin** Telegram (`TELEGRAM_ADMIN_CHAT_ID`) with `lead_id` + `job_type` only — no name, phone, or email.

### 4.3 HubSpot job ordering

`hubspot_inquiry` **must not** run until `leads.hubspot_contact_id` is set.

If the inquiry job is claimed first: set `next_attempt_at = now() + 30s`, `status='pending'`, **do not increment** `attempts` (undo the claim increment, or use a separate “deferred” path that does not count).

On HubSpot success:

- Contact job: write `hubspot_contact_id`, `hubspot_contact_synced_at_utc=now()`.
- Inquiry job: write `hubspot_inquiry_id`, `hubspot_inquiry_synced_at_utc=now()`, `hubspot_sync_status='synced'`, `hubspot_last_sync_at_utc=now()`.
- Both jobs sent → `hubspot_sync_status='synced'`.

On HubSpot error:

- `hubspot_sync_status='error'`
- `hubspot_retry_count = hubspot_retry_count + 1`
- `hubspot_last_error` = truncated message (no token)
- `hubspot_last_sync_at_utc` is **not** set on failure

HTTP 429 from HubSpot: honor `Retry-After` when present; otherwise use backoff.

### 4.4 Idempotency

| Layer | Rule |
|-------|------|
| Client | UUID `idempotency_key` in `sessionStorage` at form start. Same key on retries. |
| Neon | `UNIQUE (idempotency_key)`. Duplicate POST returns the original `lead_id` and **does not** insert a second row or a second HubSpot Deal. |
| HubSpot Contact | Upsert by `email_normalized`. |
| HubSpot inquiry | Create only if `hubspot_inquiry_id` is null. Before create, search Deals where custom `toro_lead_id` equals this UUID. If found, store that id and mark sent. |
| Outbox | `UNIQUE (lead_id, job_type)`. |
| Meta CAPI | `event_id = lead_id`. Duplicates are dropped by Meta. |

The user never waits on HubSpot. Thank-you uses Neon `lead_id` only.

---

## 5. `POST /api/v1/leads` contract

**Path:** `src/app/api/v1/leads/route.ts`  
**Method:** POST JSON  
**Auth:** public (Turnstile + honeypot + rate limit)

### 5.1 Request body (Zod)

```ts
{
  idempotency_key: uuid,
  turnstile_token: string,
  hp: string,                    // honeypot; must be empty
  elapsed_ms: number,
  form_name: "universal_quote",
  form_version: string,
  form_placement: "page" | "modal" | "embed" | "other",
  lang: "en" | "es",

  first_name: string,            // min 1
  last_name: string,             // min 1 after split-name
  phone: string,                 // 10-digit US after stripping leading 1
  email: string,                 // valid email
  preferred_contact_method?: "call" | "text" | "email",

  request_type: enabled REQUEST_TYPES.id,
  move_date?: "YYYY-MM-DD",
  move_date_flexibility: "exact" | "flexible" | "unknown",
  origin_zip: /^\d{5}$/,
  destination_zip: /^\d{5}$/,
  move_size: MOVE_SIZES.id,

  pickup_address_line_1?: string,
  pickup_city?: string,
  pickup_state?: string,
  delivery_address_line_1?: string,
  delivery_city?: string,
  delivery_state?: string,
  pickup_property_type?: PROPERTY_TYPES.id,
  delivery_property_type?: PROPERTY_TYPES.id,
  pickup_access?: ACCESS_TYPES.id,
  delivery_access?: ACCESS_TYPES.id,
  packing_help_needed?: "yes" | "no" | "not_sure",
  storage_needed?: "yes" | "no" | "not_sure",
  special_items?: SPECIAL_ITEMS.id[],
  move_notes?: string,           // max 2000

  consent_contact: true,         // required
  consent_marketing: boolean,
  consent_contact_text: string,
  consent_marketing_text: string,
  privacy_policy_version?: string,
  terms_version?: string,

  landing_page_url?: string,
  current_page_url?: string,
  referrer_url?: string,
  first_touch: AttributionObject,
  last_touch: AttributionObject,
  fbp?: string,
  fbc?: string,
  session_id?: string,
  visitor_id?: string,
}

AttributionObject = {
  utm_source?, utm_medium?, utm_campaign?, utm_term?, utm_content?,
  gclid?, gbraid?, wbraid?, fbclid?, msclkid?, ttclid?,
  landing?, referrer?, source_type?
}
```

Server also stores `user_ip` (from `x-nf-client-connection-ip` / `x-forwarded-for`) and `user_agent`.

Email normalize: `trim().toLowerCase()`.  
Phone normalize: digits only; drop leading `1` if 11 digits; store E.164 `+1XXXXXXXXXX`.

### 5.2 Responses

Success:

```json
{ "success": true, "lead_id": "<uuid>", "message": "Your request was received." }
```

Validation:

```json
{
  "success": false,
  "error_code": "VALIDATION_ERROR",
  "field_errors": { "phone": "Enter a valid phone number." }
}
```

| HTTP | When |
|------|------|
| 200 | Inserted (or idempotent replay). Includes spam_suspected (still 200 so bots learn nothing). |
| 400 | Zod validation |
| 403 | Turnstile failed |
| 429 | Rate limit (`Retry-After`) |
| 503 | Neon unavailable |

Rate limit (public): 8 requests / 10 minutes / IP on `v1:leads:{ip}` via existing Netlify Blobs helper. Fail **open** if Blobs is down (same as current `/api/crm/lead`).

Turnstile: verify `https://challenges.cloudflare.com/turnstile/v0/siteverify`. Skip only when `APP_ENV=local` **and** `TURNSTILE_SECRET_KEY` is unset.

### 5.3 Legacy endpoint

`POST /api/crm/lead` remains for `/get-my-price` and internal `x-lead-secret` call-ad logging until step L. It does **not** write Neon or HubSpot in Phase A. After L it may be deleted or turned into a thin adapter that forwards to `/api/v1/leads` for leftover callers.

---

## 6. HubSpot authentication

| Item | Approach |
|------|----------|
| Method | **Private App** (not OAuth user token, not the retired `HUBSPOT_TOKEN` env name) |
| Header | `Authorization: Bearer $HUBSPOT_PRIVATE_APP_TOKEN` |
| Base | `https://api.hubapi.com` |
| API | CRM v3 objects + v3 search + v4 associations if needed |
| Scopes | `crm.objects.contacts.read`, `crm.objects.contacts.write`, `crm.objects.deals.read`, `crm.objects.deals.write`, `crm.schemas.deals.read`. If `HUBSPOT_INQUIRY_OBJECT=lead`, also Leads read/write. |
| Pipeline / stage | **Env only** — `HUBSPOT_PIPELINE_ID`, `HUBSPOT_STAGE_NEW_ID`. Never hardcode. |
| Secrets | Netlify env. Staging uses a **separate Private App** and a HubSpot **sandbox** (preferred) or a clearly labeled test pipeline on the live portal. |
| Old n8n HubSpot nodes | **Not revived.** |

`src/lib/hubspot.ts` stubs are replaced in **step D** by `src/lib/leads/hubspot.ts`. Do not resurrect stage-button Telegram automations or n8n drips in Phase A.

Historical portal already had a **Mudanzas** deal pipeline (`scripts/hubspot-setup.mjs`). Phase A reads that pipeline ID from env if it still exists. If missing, a one-time setup script creates an “Moving inquiries” pipeline. Setup script is updated to use `HUBSPOT_PRIVATE_APP_TOKEN` and to create the custom properties in §8.

---

## 7. HubSpot Contact and inquiry object choice

### Decision

| Object | Role |
|--------|------|
| **Contact** | The person. Create or update by **normalized email** (required on this form). Secondary search: E.164 phone **only if** email search found nothing (should not happen on this form). |
| **Deal** (default inquiry) | **This specific quote request.** One Deal per Neon `lead_id`. Associated to the Contact. |

**Why Deal, not HubSpot “Leads”:** Toro already used Contact + Deal (Mudanzas). The HubSpot Leads object is not enabled on every portal. Config:

```
HUBSPOT_INQUIRY_OBJECT=deal   # default, Phase A
HUBSPOT_INQUIRY_OBJECT=lead   # later switch, no form rebuild
```

`leads.hubspot_inquiry_id` stores whichever object’s id. `leads.hubspot_inquiry_object` records which.

Do **not** collapse multiple quote requests into one Deal. Repeat submissions within 24h: new Neon row with `duplicate_of_lead_id`, **new Deal**, **same Contact**.

Deal name (claims-safe):

```
Quote request — {first_name} {last_name} — {origin_zip} to {destination_zip}
```

No amount (no fake pricing). Stage = New (`HUBSPOT_STAGE_NEW_ID`). Pipeline = `HUBSPOT_PIPELINE_ID`.

### Sync sequence (step D)

1. Normalize email.
2. `POST /crm/v3/objects/contacts/search` — filter `email` EQ normalized.
3. If found → `PATCH /crm/v3/objects/contacts/{id}` with §8 Contact fields. **Do not overwrite first-touch UTM properties if they are already set.**
4. If not found → `POST /crm/v3/objects/contacts`. On 409, search again and PATCH.
5. Save `hubspot_contact_id` on Neon.
6. Search Deals: custom `toro_lead_id` EQ this UUID. If found, save `hubspot_inquiry_id` and stop.
7. `POST /crm/v3/objects/deals` with §8 Deal fields and association:

```json
{
  "associations": [
    {
      "to": { "id": "<contactId>" },
      "types": [
        {
          "associationCategory": "HUBSPOT_DEFINED",
          "associationTypeId": 3
        }
      ]
    }
  ]
}
```

Association type `3` = Deal → Contact.

If `HUBSPOT_INQUIRY_OBJECT=lead`, create a HubSpot Lead associated to the Contact instead; same Neon columns.

---

## 8. Exact Neon → HubSpot field mapping

### 8.1 Custom properties to create (idempotent setup script)

Contact properties (group `contactinformation`). Use **string / bool**, not brittle enums, except where noted.

| Internal name | Type | Notes |
|---------------|------|--------|
| `toro_lead_id` | string | Last Neon lead id that touched this contact |
| `service_type` | string | Request-type **label** |
| `toro_request_type` | string | Request-type **id** |
| `move_date` | string | Already exists in historical portal |
| `origin_zip` | string | |
| `destination_zip` | string | |
| `move_size` | string | label |
| `sms_consent` | bool | |
| `email_consent` | bool | |
| `landing_page` | string | |
| `utm_source` `utm_medium` `utm_campaign` `utm_content` `utm_term` | string | First-touch; do not overwrite if set |
| `last_utm_source` `last_utm_medium` `last_utm_campaign` | string | Last-touch; always update |
| `gclid` `fbclid` `msclkid` `ttclid` | string | last-touch click ids |
| `funnel_type` | enumeration | Historical. **Do not write invalid options.** Phase A writes `universal_quote` only if that option exists; otherwise skip this field and rely on `service_type` / `toro_request_type`. Setup script **adds** option `universal_quote` if the property exists. |

Deal properties (group `dealinformation`):

| Internal name | Type |
|---------------|------|
| `toro_lead_id` | string (search key for idempotent create) |
| `request_type` | string (id) |
| `service_type` | string (label) |
| `origin_zip` | string |
| `destination_zip` | string |
| `move_size` | string |
| `form_placement` | string |
| `utm_campaign` | string |
| `move_date_flexibility` | string |

If a custom property is missing at runtime, **omit it** and still create the object. Never fail the job solely because a custom property 400s — retry once without the unknown property. Log `hubspot_last_error`.

### 8.2 Contact (upsert)

| HubSpot property | From Neon | Write rule |
|------------------|-----------|------------|
| `email` | `email_normalized` | match key |
| `firstname` | `first_name` | always |
| `lastname` | `last_name` | always |
| `phone` | `phone_normalized_e164` | always |
| `city` | `pickup_city` else `origin_zip` | always |
| `state` | `pickup_state` | if present |
| `zip` | `origin_zip` | always |
| `lifecyclestage` | `lead` | set on create; do not regress later stages on update |
| `hs_lead_status` | `NEW` | set on create only |
| `service_type` | label of `request_type` | always |
| `toro_request_type` | `request_type` | always |
| `toro_lead_id` | `leads.id` | always (last request) |
| `move_date` | `move_date` or flexibility label | always |
| `origin_zip` | `origin_zip` | always |
| `destination_zip` | `destination_zip` | always |
| `move_size` | move size label | always |
| `sms_consent` | `consent_contact` | always |
| `email_consent` | `consent_marketing` | always |
| `landing_page` | `landing_page_url` | always |
| `utm_source` `utm_medium` `utm_campaign` `utm_content` `utm_term` | `first_touch_*` | **create only** (keep first-touch) |
| `last_utm_source` `last_utm_medium` `last_utm_campaign` | last-touch columns | always |
| `gclid` `fbclid` `msclkid` `ttclid` | last-touch click ids | always if present |
| `funnel_type` | `universal_quote` | only if option exists |

Do **not** write `move_notes` onto the Contact. Truncated notes (max 500 chars) go on the **Deal** description.

Do **not** write any claims language into defaults, notes, or descriptions.

### 8.3 Deal / inquiry (create)

| HubSpot property | From Neon |
|------------------|-----------|
| `dealname` | `Quote request — {full_name} — {origin_zip} to {destination_zip}` |
| `pipeline` | `HUBSPOT_PIPELINE_ID` |
| `dealstage` | `HUBSPOT_STAGE_NEW_ID` |
| `closedate` | `move_date` if exact, else `created_at_utc + 30 days` |
| `dealtype` | omit (or `newbusiness` if required by portal) |
| `description` | `{request_type label}. {origin_zip} to {destination_zip}. lead_id={id}` plus truncated notes. **No claims.** |
| `toro_lead_id` | `leads.id` |
| `request_type` | id |
| `service_type` | label |
| `origin_zip` / `destination_zip` / `move_size` / `form_placement` / `utm_campaign` / `move_date_flexibility` | matching columns |
| associations | Contact `hubspot_contact_id`, type 3 |

Amount is omitted.

### 8.4 HubSpot copy claims

Deal name, description, Contact notes, and property values must pass `CLAIMS_FORBIDDEN`. QA searches created objects for those tokens.

---

## 9. Required environment variables

Never commit values. Staging vs production: **different** Netlify site/context **and** different secrets.

### Database

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Neon pooled (app) |
| `DATABASE_URL_UNPOOLED` | migrations |

### HubSpot (required Phase A)

| Variable | Purpose |
|----------|---------|
| `HUBSPOT_PRIVATE_APP_TOKEN` | CRM writes |
| `HUBSPOT_PIPELINE_ID` | Deal pipeline |
| `HUBSPOT_STAGE_NEW_ID` | New inquiry stage |
| `HUBSPOT_INQUIRY_OBJECT` | `deal` (default) or `lead` |

### Notifications

| Variable | Purpose |
|----------|---------|
| `RESEND_API_KEY` | email |
| `RESEND_FROM_EMAIL` | from address |
| `LEAD_NOTIFICATION_EMAIL` | internal To: |
| `OPENPHONE_API_KEY` | SMS |
| `OPENPHONE_FROM_NUMBER` | OpenPhone SMS **sender** — keep `+16896002720` until 321 SMS migration is approved |
| `TELEGRAM_BOT_TOKEN` | crew alerts |
| `TELEGRAM_CHAT_ID` | crew chat |
| `TELEGRAM_ADMIN_CHAT_ID` | outbox failure pings (no PII) |

### Defense / tracking

| Variable | Purpose |
|----------|---------|
| `TURNSTILE_SECRET_KEY` | server verify |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | widget |
| `NEXT_PUBLIC_META_PIXEL_ID` | browser pixel (`985575491098437`) |
| `META_ACCESS_TOKEN` | CAPI |
| `META_PIXEL_ID` | server CAPI pixel id (same as public if unset) |
| `NEXT_PUBLIC_SITE_URL` | `https://toromovers.com` or staging host |
| `NEXT_PUBLIC_GA4_ID` | optional |

### Control

| Variable | Purpose |
|----------|---------|
| `APP_ENV` | `local` \| `staging` \| `production` |
| `LEAD_NOTIFY` | `1` send adapters; `0` local dry-run (still insert Neon) |
| `QUOTE_FORM_REDIRECT_MODE` | `off` \| `temp` \| `permanent` — see §11 |
| `HUBSPOT_SYNC` | `1` (default in staging/prod). `0` skips HubSpot jobs (tests only). **Not** a production deferral. |

`APP_ENV=local` and `LEAD_NOTIFY=0`: no Telegram / SMS / email / HubSpot / CAPI; still insert Neon if `DATABASE_URL` is set.

Staging Telegram **must** be a different `TELEGRAM_CHAT_ID`. Staging HubSpot **must** be a sandbox or a labeled test pipeline. Staging Neon **must** be a separate project/branch.

---

## 10. Staging versus production

| | Staging | Production |
|--|---------|------------|
| URL | Netlify branch deploy or `staging.toromovers.com` | `https://toromovers.com` |
| Neon | separate branch / project | prod project |
| HubSpot | sandbox portal **or** test pipeline + test Private App | live Mudanzas / Moving inquiries |
| Telegram | staging chat | crew chat |
| Telegram admin | owner | owner |
| Resend | owner inbox only (`LEAD_NOTIFICATION_EMAIL`) | customer + crew |
| OpenPhone | skip SMS or a dedicated test number | send-from `(689) 600-2720`; public callback `(321) 758-0094` |
| Meta | Test Events / no ads traffic | CAPI after smoke test |
| Turnstile | staging keys | production keys |
| `/get-my-price` redirect | `QUOTE_FORM_REDIRECT_MODE=temp` on staging first | temp in prod only for redirect tests; 301 only at L |
| Ads Final URLs | unchanged | switch at **J** after smoke |

H is a hard gate: no production deploy of the new form until staging has passed the test plan in §15.

---

## 11. Redirect behavior

**Do not 301 `/get-my-price` immediately. Do not 301 until step L.**

### Approved statuses

| Status | When |
|--------|------|
| **307 Temporary Redirect** | **Only when redirect testing begins** (staging first, then a production test hop if needed) |
| **301 Moved Permanently** | Step L only — after the new funnel is stable |
| No redirect (`off`) | Default. `/get-my-price` stays the live ad funnel. Rollback switch. |

Implement 307 via Next.js `permanent: false` or middleware `NextResponse.redirect(url, 307)`. **Do not use 302** for this hop (owner: 307 only). **301 is forbidden** until `QUOTE_FORM_REDIRECT_MODE=permanent` at L.

### Implementation

Extend `src/middleware.ts` (do not break the `job-size.*` rewrite):

```
GET/HEAD https://toromovers.com/get-my-price
  → 307 Temporary Redirect
  → https://toromovers.com/get-a-quote  + original query string
```

**Preserve the entire query string**, including at least:

`utm_source` · `utm_medium` · `utm_campaign` · `utm_term` · `utm_content` · `fbclid` · `gclid` · `gbraid` · `wbraid` · `msclkid` · `ttclid`

Also preserve `service`, `source`, `return`, and any other params.

Copy method: `destination.search = request.nextUrl.search` (do not rebuild a subset).

Spanish: `/es/get-my-price` → `/es/get-a-quote` with the same status **only when** the ES universal form ships. Until then, leave ES on the legacy funnel.

### Flag

| `QUOTE_FORM_REDIRECT_MODE` | Behavior |
|----------------------------|----------|
| `off` (default) | `/get-my-price` stays live. Rollback. |
| `temp` | 307 — redirect-testing only |
| `permanent` | 301 — **step L only** |

### When the hop is used vs when ads go direct

- **H:** enable `temp` on **staging** only.
- **I:** `/get-a-quote` is live in production; `/get-my-price` still live; ads still on `/get-my-price`.
- Redirect **testing** in production uses `temp` (**307 only**) so ads that still hit `/get-my-price` land on the new form **without** caching a 301.
- **J:** Meta Final URLs change to `https://toromovers.com/get-a-quote?...` (direct, not via the hop).
- **L:** 301 `/get-my-price` → `/get-a-quote` after stability.

Existing Next redirects `/quote` and `/get-quote` currently **301 to `/get-my-price`**. Do not retarget those to `/get-a-quote` with 301 until L. During K they may 307 to `/get-a-quote`.

---

## 12. CTA migration plan (step K)

After production smoke test (**not** before I). Canonical helper: `src/lib/open-quote.ts`.

Change:

```
FUNNEL_PATH = "/get-a-quote"
FUNNEL_PATH_ES = "/es/get-a-quote"   // when ES form exists
```

`quoteFunnelUrl()` already forwards `source` / `service` / `city` / `return`. Expand `mapService()` so landing query `service=labor` maps to `request_type=moving_help`, `service=full-service` stays a generic prefill (do not invent a licensed label).

### Inventory (all applicable CTAs)

| Surface | File / note | Action at K |
|---------|-------------|-------------|
| Canonical helper | `src/lib/open-quote.ts` | `FUNNEL_PATH = "/get-a-quote"` |
| Quote modal interceptor | `src/components/quote-modal.tsx` | follows helper |
| Request button | `src/components/request-button.tsx` | follows helper |
| Sticky CTA / header / footer | `sticky-cta.tsx`, `nav.tsx`, `footer.tsx`, `hero.tsx`, `closing-cta.tsx` | href `/get-a-quote` |
| Homepage, service pages, city pages | `service-page.tsx`, `city-page.tsx`, city `QuoteFormCard` | same |
| Guides / AEO | `src/lib/guides.ts`, `src/lib/guides-aeo.ts`, `guide-page.tsx` | replace `/get-my-price` |
| Ad landings | `ad-landing.tsx`, `ad-quote-start.tsx` | `/get-a-quote` |
| Click tracking | `click-tracking.tsx` | treat `/get-a-quote` as quote CTA |
| CRM sequence links | `src/lib/crm/sequences.ts` | book/quote URL → `/get-a-quote` |
| `/quote`, `/get-quote` | `next.config.ts` | 307 to `/get-a-quote` at K; 301 at L |
| Meta / Google Final URLs | Ads Manager | **step J**, after smoke |
| Checklist magnet | `lead-magnet-form` | keep PDF; CTA to `/get-a-quote` **or** dual-write `/api/v1/leads` with `form_placement=other` (decide at K) |
| `/bookings` | Square remains source of booking | optional thin lead to `/api/v1/leads`; not a Square replacement |
| `/move-details` | ops only | **never** a sales CTA |

Do not rewire CTAs before I+smoke. Ads stay on `/get-my-price` until J.

---

## 13. Notification copy (claims-safe)

Templates live in `src/config/quote-form.ts` (or a sibling `quote-notifications.ts` imported from it). Reviewed against `CLAIMS_FORBIDDEN` before deploy.

### Telegram (crew)

Include: name, E.164 phone, email, request-type label, origin → dest ZIP, date/flexibility, size, `lead_id`, source/UTM summary, HubSpot sync pending/synced.  
Do **not** include licensed/insured language.  
Prefix: `New quote request` (not “insured move”).

### Resend customer

Subject: `We received your Toro Movers quote request`  
Body: we received the request; a team member will contact you; phone `(321) 758-0094`. No insurance/licensing claims. No fake pricing.

### Resend internal

Same fields as Telegram. To: `LEAD_NOTIFICATION_EMAIL`.

### OpenPhone / SMS

Reuse the existing claims-safe quote-received SMS (`src/lib/crm/quote-confirmation.ts`) — it does not claim licensed/insured. Do not add new claim language. Send only if `consent_contact` is true.

### Thank-you page

No PII in the URL. Copy: request received; team will contact you. Current “Up-front hourly pricing” is allowed; licensed/insured is not. Fire Pixel `Lead` with `eventID = ref` (the `lead_id`). Stop using `CompleteRegistration` as the quote conversion.

---

## 14. Meta Pixel + CAPI (step G)

| Rule | Detail |
|------|--------|
| When | **Only after** Neon insert returns `lead_id` |
| Event | `Lead` (not InitiateCheckout, not CompleteRegistration, for this conversion) |
| `event_id` | `lead_id` (same UUID in Pixel `eventID` and CAPI `event_id`) |
| Browser | `/thank-you?ref={lead_id}` calls `trackLead(lead_id)` |
| Server | outbox job `meta_capi` after insert |
| User data | hashed email, hashed phone E.164, `fbp`, `fbc`, client IP, user agent |
| `event_source_url` | `https://toromovers.com/thank-you?ref={lead_id}` |
| `action_source` | `website` |
| Ads Final URLs | **step J**, after production smoke including dedupe in Events Manager |

Do not fire Lead on soft-capture or step 1. Do not fire Lead if Neon insert failed.

Attribution capture (`src/lib/utm.ts`) must be extended to store `gbraid`, `wbraid`, `msclkid`, `ttclid` in addition to the current `utm_*`, `gclid`, `fbclid`. First-touch stays first-touch; last-touch is read at submit from the current URL.

---

## 15. Full test plan

### 15.1 Unit / contract (during C–D)

- Zod accepts each of the nine enabled `request_type` ids and rejects a disabled id.
- Email normalize: `  A@B.COM ` → `a@b.com`.
- Customer phone normalize (not the business number): `(407) 555-0100`, `+1 407-555-0100`, `14075550100` → `+14075550100`.
- Old-number grep (must be absent as Toro callback): `6896002720`, `+16896002720`, `(689) 600-2720`, `689-600-2720`.
- Duplicate `idempotency_key` → same `lead_id`, one row, one Deal.
- Outbox backoff schedule.
- HubSpot mapper omits unknown properties; dealname has no claims tokens.
- Grep `CLAIMS_FORBIDDEN` across `src/config/quote-form.ts`, notification templates, thank-you, HubSpot mapper.

### 15.2 Staging end-to-end (step H) — required before I

Use staging Neon, staging HubSpot, staging Telegram, staging Turnstile, Meta Test Events.

| # | Case | Pass |
|---|------|------|
| 1 | 4-step complete, desktop Chrome | Neon row, HubSpot Contact+Deal, Telegram staging, Resend, CAPI test |
| 2 | iPhone Safari | same |
| 3 | Android Chrome | same |
| 4 | Unknown date + ZIP-only (no street) | insert succeeds; HubSpot still created |
| 5 | All nine request types selectable and stored | `request_type` matches |
| 6 | Consent boxes start unchecked; submit blocked until contact consent | |
| 7 | Duplicate email within 24h | second Neon row, `duplicate_of_lead_id`, **second Deal**, same Contact |
| 8 | Duplicate phone within 24h | same as 7 |
| 9 | Replay same `idempotency_key` | one Neon row, one Deal |
| 10 | Turnstile fail | 403, no Neon row |
| 11 | Honeypot filled | 200, `spam_suspected`, no crew Telegram, no CAPI, no customer SMS |
| 12 | Submit &lt; 1.2s | same as honeypot |
| 13 | **Kill HubSpot token** | user still reaches thank-you; Neon `hubspot_sync_status=error`; outbox retries; restore token; Contact+Deal appear; status `synced` |
| 14 | Kill Telegram | lead in Neon; retry then staging alert |
| 15 | Thank-you URL has no name/phone/email | only `ref={uuid}` |
| 16 | One Meta CAPI `Lead` with `event_id = lead_id`; Pixel `eventID` matches; Events Manager shows deduped (not 2) | |
| 17 | Query-string redirect (staging `/get-my-price?...all params…`) | 307 or 302 to `/get-a-quote` with **all** params intact |
| 18 | Copy grep: licensed, insured, bonded, certified, DOT, FMCSA, cargo, fully covered — **absent** from form, HubSpot dealname/description, emails, SMS, Telegram, thank-you |
| 18b | Public callback in UI, JSON-LD, emails, SMS **body**, Telegram, thank-you is `(321) 758-0094`. OpenPhone API `from` remains `+16896002720`. Do not display `(689) 600-2720` as the business number. | |
| 19 | Rate limit 9th POST in 10 min | 429 |
| 20 | Neon down (bad `DATABASE_URL`) | 503, no thank-you, no HubSpot |

### 15.3 Production smoke (after I, before J)

One real **TEST** lead, labeled in notes, known phone:

1. Neon row with valid `lead_id`.
2. HubSpot Contact upserted + Deal associated.
3. Crew Telegram on production chat.
4. Customer Resend + SMS.
5. CAPI + Pixel Lead, same `event_id`, Events Manager deduped.
6. Attribution columns populated from a URL that includes `utm_*` + `fbclid`.
7. Then mark the Deal Lost in HubSpot / note TEST.

**Only then** change Meta Final URLs (J).

### 15.4 After J / K / L

- Ads land on `/get-a-quote` with UTMs + `fbclid`.
- Site CTAs open `/get-a-quote`.
- After stability window, 301 `/get-my-price` and confirm crawlers/ads still convert.

---

## 16. Rollback plan

| Symptom | Action |
|---------|--------|
| Form 5xx / cannot insert Neon | `QUOTE_FORM_REDIRECT_MODE=off`. `/get-my-price` live again. Ads Final URLs unchanged if J has not run. |
| HubSpot outage | **Do nothing to the form.** Outbox retries. User flow unchanged. Do not disable HubSpot as a product decision. |
| Telegram / SMS / Resend outage | Same — outbox retries. User still gets thank-you. |
| Bad copy / claims | Revert `quote-form.ts` + notification templates; redeploy. |
| Meta conversion mismatch | Keep ads on `/get-my-price` (do not execute J). Pixel/CAPI can stay; Final URLs wait. |
| HubSpot wrong pipeline | Fix env IDs; outbox retries or a one-off backfill by `lead_id`. |
| Full abort | Leave `/api/v1/leads` deployed but unused. Legacy `/api/crm/lead` + `/get-my-price` remain. |

No 301 is applied until L, so rollback does not fight browser-cached permanent redirects. After L, rollback of the URL hop is harder (cached 301); that is why L is last.

---

## 17. Implementation map (not coded until B+)

| Path | Role |
|------|------|
| `src/config/quote-form.ts` | Copy, `REQUEST_TYPES`, `CLAIMS_FORBIDDEN` |
| `src/lib/leads/migrations/001_init.sql` | Schema |
| `src/lib/leads/db.ts` | Neon client |
| `src/lib/leads/schema.ts` | Zod |
| `src/lib/leads/outbox.ts` | enqueue + claim |
| `src/lib/leads/hubspot.ts` | Contact upsert + inquiry create |
| `src/lib/leads/adapters/*` | telegram, resend, sms, capi |
| `src/app/api/v1/leads/route.ts` | HTTP handler |
| `src/app/(funnel)/get-a-quote/page.tsx` | Page (exists; rewire in E) |
| `src/components/quote/universal-quote-form.tsx` | Form (exists; post `/api/v1/leads` in E) |
| `src/app/(site)/thank-you/page.tsx` | Thank-you (F/G) |
| `src/middleware.ts` | 302/307 query-preserving redirect |
| `netlify/functions/process-outbox.mts` | Worker |
| `scripts/hubspot-setup.mjs` | Properties + pipeline (update token name) |

---

## 18. Duplicate rules

Same `email_normalized` **or** same `phone_normalized_e164` within **24 hours**:

- New `leads` row
- `duplicate_of_lead_id` set
- `lead_events.repeat_submission`
- **New HubSpot Deal**
- **Same HubSpot Contact**
- Notifications still fire (crew should know it is a repeat)

No auto-delete. No merge on ZIP or email domain alone.

---

## 19. Phase B / C (not Phase A)

- File uploads + malware scan (`lead_files` already in schema)
- SLA 5–10 / 15–30 min reminders
- `/admin/leads` reporting UI
- CallRail / live chat products
- Spanish `/es/get-a-quote`
- Reviving HubSpot stage-button Telegram automation / n8n drips

Schema columns/hooks exist so these do not require a form rewrite.

---

## 20. Open items besides §21

- Turnstile site/secret keys (staging + prod).
- Terms: `/privacy` exists; `/terms` still needed beside the checkbox, or privacy-only until Terms are written.
- Meta CAPI `META_ACCESS_TOKEN` (pixel `985575491098437`; current skill token expires 2026-09-07 — rotate before then).
- Live Meta / Google ads that still show `(689) 600-2720` must be updated in Ads Manager (not in this repo). Do not switch Final URLs to `/get-a-quote` until Step J.

---

## 21. Access / setup checklist (required before Step B)

Do **not** begin Neon schema, `/api/v1/leads`, or HubSpot client code until items 1–7 below are filled. Do **not** begin production deployment until staging QA passes and the owner approves.

A copy of this checklist also lives in `docs/phase-a-access-checklist.md`.

### 1. Neon production database connection string

1. Sign in at [https://console.neon.tech](https://console.neon.tech).
2. Create a project named **`toro-movers-prod`** (region: US East, Postgres 16).
3. Open **Dashboard → Connection details**.
4. Copy **pooled** connection string (includes `-pooler` in the host) → Netlify production env `DATABASE_URL`.
5. Copy **direct / unpooled** connection string → Netlify production env `DATABASE_URL_UNPOOLED` (migrations).
6. Confirm SSL is required (`sslmode=require` is default on Neon).
7. Record: project ID, branch (`main`), and that this database is **empty** (no shared staging data).

Paste when ready (do not commit):

```
DATABASE_URL=postgres://…-pooler…/neondb?sslmode=require
DATABASE_URL_UNPOOLED=postgres://…/neondb?sslmode=require
```

### 2. Neon staging database connection string

1. Either: **Create a second Neon project** `toro-movers-staging`, **or** create a **child branch** of prod named `staging` (separate compute).
2. Copy pooled → Netlify **branch/staging** context `DATABASE_URL`.
3. Copy unpooled → staging `DATABASE_URL_UNPOOLED`.
4. Never point staging at the prod database.

### 3. HubSpot Private App — creation steps and minimum scopes

1. HubSpot portal → **Settings (gear)** → **Integrations → Private Apps**.
2. **Create a private app**. Name: `Toro Movers website leads` (production) and a **second** app `Toro Movers staging` (or use a HubSpot sandbox portal).
3. **Scopes — minimum (Phase A):**
   - `crm.objects.contacts.read`
   - `crm.objects.contacts.write`
   - `crm.objects.deals.read`
   - `crm.objects.deals.write`
   - `crm.schemas.deals.read`
4. Optional later (not required for Phase A): `crm.objects.leads.read` / `crm.objects.leads.write` only if `HUBSPOT_INQUIRY_OBJECT=lead`.
5. Create the app → **copy the token once** (`pat-na1-…` or `pat-na2-…`).
6. Store as Netlify env `HUBSPOT_PRIVATE_APP_TOKEN` (production app on production context; staging app on staging context). Never commit the token.
7. Do not reuse the retired `HUBSPOT_TOKEN` name.

Verify with:

```bash
curl -sS https://api.hubapi.com/crm/v3/objects/contacts?limit=1 \
  -H "Authorization: Bearer $HUBSPOT_PRIVATE_APP_TOKEN"
```

Expect HTTP 200.

### 4. Existing Mudanzas pipeline ID

```bash
curl -sS https://api.hubapi.com/crm/v3/pipelines/deals \
  -H "Authorization: Bearer $HUBSPOT_PRIVATE_APP_TOKEN" \
  | python3 -c "import json,sys; d=json.load(sys.stdin);
[print(p['id'], p['label']) for p in d.get('results',[])]"
```

Find the row labeled **Mudanzas**. That id is `HUBSPOT_PIPELINE_ID`.

If Mudanzas is missing: run `node scripts/hubspot-setup.mjs` (updated to read `HUBSPOT_PRIVATE_APP_TOKEN`) **or** create a pipeline named **Moving inquiries**. Do not hardcode the id in source.

### 5. HubSpot “New” deal-stage ID for incoming website leads

Using the Mudanzas pipeline id from step 4:

```bash
curl -sS https://api.hubapi.com/crm/v3/pipelines/deals/$HUBSPOT_PIPELINE_ID \
  -H "Authorization: Bearer $HUBSPOT_PRIVATE_APP_TOKEN" \
  | python3 -c "import json,sys; p=json.load(sys.stdin);
[print(s['id'], s['label'], s['displayOrder']) for s in sorted(p['stages'], key=lambda x: x['displayOrder'])]"
```

Use the stage labeled **New Lead** (or the first open stage for new website inquiries) as `HUBSPOT_STAGE_NEW_ID`.

Historical labels from `scripts/hubspot-setup.mjs`: New Lead → Contacted → Quote Sent → Booked / Scheduled → Move Completed → Won → Lost.

### 6. Dedicated staging Telegram chat / group and credentials

1. In Telegram, create a **new group** e.g. `Toro staging leads` (not the live crew chat).
2. Create or reuse a bot via [@BotFather](https://t.me/BotFather). Staging may share the bot token with prod **only if** the chat id is different; a separate staging bot is cleaner.
3. Add the bot to the staging group.
4. Post any message in the group, then:

```bash
curl -sS "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/getUpdates"
```

5. Copy the staging `chat.id` (often a negative integer for groups).
6. Netlify **staging** env:
   - `TELEGRAM_BOT_TOKEN` (staging bot or shared bot)
   - `TELEGRAM_CHAT_ID` = staging group id
   - `TELEGRAM_ADMIN_CHAT_ID` = owner DM or a tiny admin group (outbox failures; no PII)
7. Netlify **production** env keeps the live crew `TELEGRAM_CHAT_ID`. Confirm they are **different values**.

Send a test: `https://api.telegram.org/bot$TOKEN/sendMessage?chat_id=$STAGING_CHAT_ID&text=staging-ok`

### 7. OpenPhone SMS and calls

**Current production split (approved):**

| | Number | Env / config |
|--|--------|----------------|
| Public website, click-to-call, JSON-LD, customer-facing contact | `(321) 758-0094` | `src/config/business.ts` |
| OpenPhone **outbound confirmation SMS** | `(689) 600-2720` | `OPENPHONE_FROM_NUMBER=+16896002720` |

Keep Netlify / `.env`:

```bash
OPENPHONE_FROM_NUMBER=+16896002720
```

Do **not** set `OPENPHONE_FROM_NUMBER=+13217580094` yet.

Checklist:

- [ ] Customers can **call** `(321) 758-0094` (inbound voice).
- [ ] Customers may **text** `(321) 758-0094` (inbound SMS on the public line, when that line is in OpenPhone).
- [ ] Automated confirmation SMS still **send from** `(689) 600-2720`. That OpenPhone number stays active.
- [ ] Netlify `OPENPHONE_FROM_NUMBER` is `+16896002720` (not 321).
- [ ] Site display already uses `(321) 758-0094` from `src/config/business.ts`.

**Later, only after both pass and the owner approves a migration:**

- [ ] `(321) 758-0094` is a Toro line in OpenPhone/Quo.
- [ ] Test **send** SMS via API `from=+13217580094`.
- [ ] Test **receive** SMS replies on that number.
- [ ] Then — and only then — change `OPENPHONE_FROM_NUMBER=+13217580094`.

### After §21 is filled

Then Step B: Neon schema, migrations, outbox. Then C–H in order. Production deploy (I) only after staging QA. Meta Final URLs (J) only after production smoke. Owner must approve the production release.

---

## Appendix A — Client submit flow (step E)

1. Form start: mint `idempotency_key`; capture first-touch attribution (expanded click ids).
2. Steps 1–4 as specified. Consent boxes start **unchecked**. Contact consent required.
3. Turnstile token at submit.
4. `POST /api/v1/leads`.
5. On `success` + `lead_id`: `window.location.assign("/thank-you?ref=" + lead_id)`.
6. On 4xx validation: show `field_errors`. On 503: call CTA uses `phoneDisplay` from `src/config/business.ts` — currently “Couldn’t send. Call (321) 758-0094.”
7. Do not navigate to thank-you without a `lead_id`.

Preview debt to remove in E: `universal-quote-form.tsx` currently `fetch("/api/crm/lead")`. That must become `/api/v1/leads`.

---

**Step B does not start until §21 items 1–6 are provided.** Item 7 can overlap with B/C but must be confirmed before production SMS. No production deployment until staging passes and the owner approves.
