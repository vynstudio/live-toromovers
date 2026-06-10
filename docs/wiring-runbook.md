# n8n automation wiring — runbook

The site code is fully wired: both funnel APIs fire a fire-and-forget webhook to
n8n after instant delivery, with a hard 2.5s timeout (a slow/down n8n never
blocks the thank-you page). What's left is **dashboard config** — done in n8n,
Railway, Netlify and HubSpot, not in code.

## Contract (already implemented in the site)

| Funnel | API route | Env var | n8n webhook path |
|---|---|---|---|
| Checklist magnet | `POST /api/lead-magnet` | `N8N_LEAD_WEBHOOK_URL` | `/webhook/toro-checklist-lead` |
| Labor-only + Full-service | `POST /api/funnel-lead` | `N8N_FUNNEL_WEBHOOK_URL` | `/webhook/toro-funnel-lead` |

Funnel routing: the funnel webhook payload carries `funnel: "labor" | "full-service"`;
the workflow's first IF node branches on it. The checklist payload carries
`funnel: "checklist"`.

### Payload sent to n8n (camelCase — matches the imported workflows)
```jsonc
{
  "event": "funnel_submit",            // or "lead_magnet_submit"
  "funnel": "labor",                   // labor | full-service | checklist
  "serviceType": "Loading help, Both", // labor help / property+packing / move label
  "firstName": "...", "email": "...", "phone": "...",
  "city": "...", "moveDate": "This week",
  "consentSms": true, "smsConsent": true,   // both names sent; workflow reads smsConsent/smsOptIn
  "consentEmail": true,
  "helpNeeded": ["Both"],              // labor only
  "propertyType": "House", "packingHelp": true,  // full-service only
  "lang": "en",
  "source": "utm_source=facebook · utm_medium=cpc · …",  // human-readable
  "utm": { "utm_source": "facebook", "utm_medium": "cpc", "utm_campaign": "…" }, // structured → HubSpot
  "landingPage": "/labor-only-moving",
  "links": { "quote": "https://toromovers.net/quote" }
}
```

## 1. Railway — n8n env vars
On the n8n service:
```
N8N_HOST=<your n8n subdomain>.up.railway.app
N8N_PORT=5678
N8N_PROTOCOL=https
WEBHOOK_URL=https://<your n8n subdomain>.up.railway.app/   # MUST be set or webhook URLs are wrong
N8N_ENCRYPTION_KEY=<openssl rand -hex 32>                  # set ONCE, never change after creds saved
DB_TYPE=postgresdb
DB_POSTGRESDB_URL=<Railway Postgres connection string>      # use the Postgres plugin, not SQLite, for persistence
GENERIC_TIMEZONE=America/New_York
# Credentials the workflow HTTP nodes read via {{$env.…}}:
RESEND_API_KEY=<same as Netlify>
OPENPHONE_API_KEY=<same as Netlify>
OPENPHONE_FROM_NUMBER=+16896002720
# If you enable basic auth on the n8n editor:
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=<user>
N8N_BASIC_AUTH_PASSWORD=<pass>
# Queue mode is NOT needed at this volume — skip Redis/QUEUE_* unless you scale workers.
```

## 2. n8n — import the workflows
1. n8n → **Workflows → Import from File**:
   - `docs/n8n-funnel.workflow.json`  → "Toro Movers — Lead Funnels Drip (labor + full-service)"
   - `docs/n8n-checklist-funnel.workflow.json` → "Toro Movers — Checklist Funnel Drip"
2. Open each, **Activate** (toggle top-right). Activation registers the production webhook.
3. On each **Webhook** node, copy the **Production URL** (looks like
   `https://…railway.app/webhook/toro-funnel-lead`).
4. (Recommended) add an **IF** node right after each Webhook comparing header
   `x-toro-secret` to `$env.N8N_WEBHOOK_SECRET`; false → NoOp, true → continue.

## 3. Netlify — site env vars
Site settings → Environment variables → add, then redeploy:
```
N8N_FUNNEL_WEBHOOK_URL = https://…railway.app/webhook/toro-funnel-lead
N8N_LEAD_WEBHOOK_URL   = https://…railway.app/webhook/toro-checklist-lead
N8N_WEBHOOK_SECRET     = <same value as Railway>   # optional but recommended
```
Until these are set, the site works exactly as today (instant delivery only,
drip skipped). No redeploy needed for code — only to pick up the env vars.

## 4. HubSpot — routing fields
The **native** upsert (in the API routes) only writes safe standard properties
(`email, firstname, phone, city, lifecyclestage, hs_lead_status`) plus a note
with the funnel/service/UTM/timestamp, so a missing custom field can never 400
the upsert. To get structured columns, create these **contact properties** in
HubSpot (Settings → Properties → Contact), then map them in the n8n "HubSpot →
Upsert contact" node from the payload:

| HubSpot property (internal name) | Type | From payload |
|---|---|---|
| `funnel_type` | dropdown (labor/full-service/checklist) | `funnel` |
| `service_type` | single-line text | `serviceType` |
| `move_date` | single-line text | `moveDate` |
| `city` | (standard) | `city` |
| `landing_page` | single-line text | `landingPage` |
| `utm_source` / `utm_medium` / `utm_campaign` / `utm_content` | text | `utm.*` |
| `lead_intent` | dropdown (high/med) | set "high" for labor/full-service, "med" for checklist |
| `deal_stage` | dropdown | set in n8n (e.g. "new") |
| `sms_consent` | bool | `consentSms` |
| `email_consent` | bool | `consentEmail` |
| `follow_up_status` | dropdown | set "in_sequence" when drip starts |
| `assigned_rep` | HubSpot owner | round-robin / static in n8n |

If you also want the **site** to write `funnel_type` directly, create that one
property and set `HUBSPOT_HAS_FUNNEL_TYPE=1` on Netlify.

## 5. Verify (no real keys needed)
Run the local capture test — it points the webhook env at a throwaway listener
and submits all three funnels, proving the right branch + fields fire:
```
node scripts/test-webhooks.mjs
```
Then in production, after wiring: submit each funnel once and watch the n8n
**Executions** tab — you should see one execution per submit on the correct
branch, plus the Resend/OpenPhone nodes succeeding.

## Acceptance checklist
- [ ] Checklist submit → execution on the checklist workflow
- [ ] Labor submit → labor branch of the funnel workflow
- [ ] Full-service submit → full-service branch
- [ ] HubSpot contact shows funnel/service/UTM fields (native note always; columns once mapped)
- [ ] Resend drip emails queue (check n8n execution + Resend dashboard)
- [ ] OpenPhone SMS send when `consentSms=true`
- [ ] CAPI Lead still fires (Events Manager → Test Events) — unchanged, native
- [ ] Thank-you page still loads instantly even with n8n stopped (timeout proof)
