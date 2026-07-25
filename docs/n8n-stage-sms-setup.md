# Wire n8n delayed stage SMS (production)

Your n8n host: `https://n8n-production-d3d0.up.railway.app`

## What this does

| When | Instant (site) | Delayed (n8n) |
|------|----------------|---------------|
| New lead (`intakeLead`) | `new_0` SMS+email | `new_1h` → `new_24h` → `new_72h` |
| Stage change (Telegram/API) | that stage’s `*_0` | remaining delays for that stage |

n8n only waits and calls:

`POST https://toromovers.net/api/crm/sequences/stage-run`

---

## 1. Import workflow

1. Open n8n → **Workflows → Import from File**
2. File: `docs/n8n-stage-sms-drip.workflow.json`
3. Open **Toro Movers — Stage SMS drip (HubSpot delays)**
4. **Activate** the workflow (top-right toggle)
5. Open the **Webhook stage SMS** node → copy **Production URL**

It should look like:

```text
https://n8n-production-d3d0.up.railway.app/webhook/toro-stage-sms-drip
```

---

## 2. Railway n8n env

On the n8n Railway service, ensure:

```bash
WEBHOOK_URL=https://n8n-production-d3d0.up.railway.app/
N8N_WEBHOOK_SECRET=<same as Netlify N8N_WEBHOOK_SECRET>
LEAD_INTAKE_SECRET=<same as Netlify LEAD_INTAKE_SECRET>   # optional; site accepts x-toro-secret too
GENERIC_TIMEZONE=America/New_York
```

Wait nodes need **queue mode or a persistent DB** (you already use Postgres on Railway — good).

---

## 3. Netlify env (toromovers.net / live-toro-site)

Add or update:

```bash
N8N_CRM_WEBHOOK_URL=https://n8n-production-d3d0.up.railway.app/webhook/toro-stage-sms-drip
N8N_STAGE_WEBHOOK_URL=https://n8n-production-d3d0.up.railway.app/webhook/toro-stage-sms-drip
```

Keep existing:

```bash
N8N_FUNNEL_WEBHOOK_URL=.../webhook/toro-funnel-lead   # labor/full-service marketing drip (unchanged)
N8N_WEBHOOK_SECRET=...
```

Redeploy **live-toro-site** after setting env (or use Netlify UI “Trigger deploy”).

Site code prefers:

`N8N_CRM_WEBHOOK_URL` → `N8N_STAGE_WEBHOOK_URL` → `N8N_FUNNEL_WEBHOOK_URL`

---

## 4. Test (fast path)

### A. Instant only (no wait)

```bash
curl -s -X POST https://toromovers.net/api/crm/sequences/stage-run \
  -H "Content-Type: application/json" \
  -H "x-lead-secret: $LEAD_INTAKE_SECRET" \
  -d '{
    "stage": "newLead",
    "stepId": "new_1h",
    "firstName": "Diler",
    "phone": "+13217580094",
    "consentSms": true,
    "consentEmail": true
  }'
```

You should get SMS immediately.

### B. Full webhook → n8n (1 minute test)

Temporarily edit plan or send a fake payload with `delayMinutes: 1`:

```bash
curl -s -X POST "https://n8n-production-d3d0.up.railway.app/webhook/toro-stage-sms-drip" \
  -H "Content-Type: application/json" \
  -H "x-toro-secret: $N8N_WEBHOOK_SECRET" \
  -d '{
    "event": "crm_lead",
    "stage": "newLead",
    "firstName": "Diler",
    "phone": "+13217580094",
    "consentSms": true,
    "delayedSteps": [
      { "id": "new_1h", "delayMinutes": 1, "channel": "sms" }
    ]
  }'
```

In n8n **Executions**, you should see Wait 1m then HTTP 200 from stage-run.

### C. Real new lead

Submit a quote form (or `POST /api/crm/lead`) with phone + SMS consent.  
Instant SMS = site.  
+1h / +24h / +72h = n8n.

---

## 5. SMS counts (reference)

| Stage | Instant | Delayed |
|-------|---------|---------|
| New Lead | 1 | 3 (1h, 24h, 72h) |
| No Answer | 1 | 2 (4h, 24h) |
| Contacted | 1 | 1 (24h) |
| Quote Sent | 1 | 2 (24h, 48h) |
| Booked | 1 | 1 (eve) |
| Move Done | 1 review | 0 |

---

## Troubleshooting

| Symptom | Check |
|---------|--------|
| No delayed SMS | Workflow **Active**? Correct Production webhook URL in Netlify? |
| Instant works, delayed never | Railway n8n **Wait** needs DB; check Executions for stuck waits |
| 401 on stage-run | `N8N_WEBHOOK_SECRET` / `LEAD_INTAKE_SECRET` match Netlify |
| SMS not delivered | OpenPhone keys on **live-toro-site**; phone E.164; consentSms |
| Double SMS at 1h | Old CRM drip workflow still active on same lead — deactivate old “followup_1h” path for CRM events or don’t dual-subscribe |

If both **old CRM drip** (`toro-crm-drip`) and **new stage drip** run, turn off the old one for `crm_lead` events.
