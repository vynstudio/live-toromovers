# Phase A — access / setup checklist

**Gate:** Step B (Neon schema, migrations, outbox) does not start until items 1–6 are complete.  
**Gate:** No production deploy until staging QA passes **and** the owner approves.  
**Canonical architecture:** `docs/quote-system-architecture.md` §21.

Public callback number (already in `src/config/business.ts`):

- Display: `(321) 758-0094`
- E.164: `+13217580094`
- Click-to-call: `tel:+13217580094`

Do not rewrite customer phones on existing leads.

---

## 1. Neon production `DATABASE_URL`

- [ ] Neon project `toro-movers-prod` created (US East, Postgres 16)
- [ ] Pooled string → Netlify **production** `DATABASE_URL`
- [ ] Direct/unpooled string → Netlify **production** `DATABASE_URL_UNPOOLED`
- [ ] `sslmode=require`
- [ ] Database is empty / dedicated to prod

```
DATABASE_URL=postgres://USER:PASS@HOST-pooler/neondb?sslmode=require
DATABASE_URL_UNPOOLED=postgres://USER:PASS@HOST/neondb?sslmode=require
```

## 2. Neon staging `DATABASE_URL`

- [ ] Separate project `toro-movers-staging` **or** Neon branch `staging`
- [ ] Pooled → Netlify **staging/branch** `DATABASE_URL`
- [ ] Unpooled → staging `DATABASE_URL_UNPOOLED`
- [ ] Staging is **not** the prod database

## 3. HubSpot Private App + scopes

**Settings → Integrations → Private Apps → Create**

Production app name: `Toro Movers website leads`  
Staging: second app **or** HubSpot sandbox.

Minimum scopes:

- [ ] `crm.objects.contacts.read`
- [ ] `crm.objects.contacts.write`
- [ ] `crm.objects.deals.read`
- [ ] `crm.objects.deals.write`
- [ ] `crm.schemas.deals.read`

- [ ] Token stored as `HUBSPOT_PRIVATE_APP_TOKEN` (never committed)
- [ ] Staging token ≠ production token (or sandbox portal)
- [ ] Verify: `GET https://api.hubapi.com/crm/v3/objects/contacts?limit=1` returns 200

## 4. Mudanzas pipeline ID

```bash
curl -sS https://api.hubapi.com/crm/v3/pipelines/deals \
  -H "Authorization: Bearer $HUBSPOT_PRIVATE_APP_TOKEN"
```

- [ ] Pipeline labeled **Mudanzas** found
- [ ] `HUBSPOT_PIPELINE_ID=<id>`
- [ ] If missing: run setup script or create **Moving inquiries**

## 5. “New” deal stage ID

```bash
curl -sS https://api.hubapi.com/crm/v3/pipelines/deals/$HUBSPOT_PIPELINE_ID \
  -H "Authorization: Bearer $HUBSPOT_PRIVATE_APP_TOKEN"
```

- [ ] Stage for new website leads identified (**New Lead**)
- [ ] `HUBSPOT_STAGE_NEW_ID=<id>`
- [ ] `HUBSPOT_INQUIRY_OBJECT=deal`

Incoming website Deals associate to the upserted Contact (HubSpot association type **3**).

## 6. Staging Telegram

- [ ] New group (example: `Toro staging leads`) — **not** the live crew chat
- [ ] Bot added to the group
- [ ] Staging `TELEGRAM_CHAT_ID` retrieved via `getUpdates`
- [ ] `TELEGRAM_ADMIN_CHAT_ID` for outbox failures (no PII in those pings)
- [ ] Staging chat id **≠** production crew chat id
- [ ] Test message received in the staging group

## 7. OpenPhone SMS and calls

**Approved split now:**

- Public / click-to-call / JSON-LD: `(321) 758-0094`
- Outbound confirmation SMS sender: `(689) 600-2720`

```bash
OPENPHONE_FROM_NUMBER=+16896002720
```

Do **not** set `OPENPHONE_FROM_NUMBER=+13217580094` yet.

- [ ] Customers can call `(321) 758-0094`
- [ ] Customers may SMS `(321) 758-0094` (public inbound)
- [ ] Confirmation SMS still send from `(689) 600-2720`
- [ ] Netlify `OPENPHONE_FROM_NUMBER=+16896002720`
- [ ] Site copy uses `(321) 758-0094` from `src/config/business.ts`

**SMS sender migration (later, owner-approved only):**

- [ ] `(321) 758-0094` is in OpenPhone/Quo
- [ ] Send test from `+13217580094` succeeds
- [ ] Receive/reply test on that number succeeds
- [ ] Then update `OPENPHONE_FROM_NUMBER=+13217580094`

---

## Also before live Meta traffic to `/get-a-quote` (Step J)

Not required to start Step B, but required before ads point at the new form:

- [ ] Neon insert returns `lead_id`
- [ ] HubSpot Contact upsert + Deal associated
- [ ] Staging then production Telegram
- [ ] Resend customer + internal email
- [ ] OpenPhone/SMS workflow
- [ ] Attribution (UTM + click ids)
- [ ] `/thank-you?ref={lead_id}` only after insert
- [ ] Pixel + CAPI `Lead` with `event_id = lead_id` (deduped)
- [ ] Owner approves production release
