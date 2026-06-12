// Adds an immediate "we tried to reach you" follow-up (SMS + email) to the
// Telegram stage workflow, fired the moment the team taps "No Answer" (s=a /
// Contact Attempt). The day-2/day-5 nurture keeps running separately.
//   N8N_API_KEY=... node scripts/n8n-noanswer-followup.mjs

const BASE = (process.env.N8N_BASE_URL || "https://n8n-production-d3d0.up.railway.app").replace(/\/$/, "");
const KEY = process.env.N8N_API_KEY;
const ID = "pNGUHuhKcC8NsCNK"; // Toro — Telegram stage buttons
const RESEND_CRED = { httpHeaderAuth: { id: "UWyHQa26WwWRA3Jc", name: "Resend (Toro funnels)" } };
const OPENPHONE_CRED = { httpHeaderAuth: { id: "4IGHoQcPvbabvxEu", name: "OpenPhone Quo (Toro funnels)" } };
const H = { "X-N8N-API-KEY": KEY, "Content-Type": "application/json" };
const api = async (p, o = {}) => {
  const r = await fetch(`${BASE}/api/v1${p}`, { headers: H, ...o });
  const t = await r.text(); let j = null; try { j = JSON.parse(t); } catch {}
  return { status: r.status, json: j, text: t };
};

const wf = (await api(`/workflows/${ID}`)).json;

// 0) bail if already added
if (wf.nodes.some((n) => n.name === "No answer?")) {
  console.log("already installed — nothing to do");
  process.exit(0);
}

// 1) make Find contact return firstname + phone too
const find = wf.nodes.find((n) => n.name === "Find contact");
find.parameters.jsonBody = "={\n  \"filterGroups\": [{ \"filters\": [{ \"propertyName\": \"email\", \"operator\": \"EQ\", \"value\": \"{{ $('Parse').first().json.email }}\" }] }],\n  \"properties\": [\"email\", \"firstname\", \"phone\"],\n  \"limit\": 1\n}";

// inner n8n expressions (embedded inside an `=`-prefixed jsonBody, so no `=`)
const fn = "{{ $('Find contact').first().json.results[0].properties.firstname || 'there' }}";
const ph = "{{ $('Find contact').first().json.results[0].properties.phone }}";

// 2) new nodes
const ifNoAns = {
  parameters: {
    conditions: { options: { caseSensitive: true, version: 2 }, combinator: "and",
      conditions: [{ leftValue: "={{ $('Parse').first().json.code }}", rightValue: "a", operator: { type: "string", operation: "equals" } }] },
    options: {},
  },
  name: "No answer?", type: "n8n-nodes-base.if", typeVersion: 2, position: [580, 300],
};
const fSms = {
  parameters: {
    method: "POST", url: "https://api.openphone.com/v1/messages",
    authentication: "genericCredentialType", genericAuthType: "httpHeaderAuth",
    sendBody: true, specifyBody: "json",
    jsonBody: `={\n  "from": "+16896002720",\n  "to": ["${ph}"],\n  "content": "Hi ${fn}, this is Toro Movers — we just tried to reach you about your move. When's a good time to call? Or get your up-front quote: https://toromovers.net/quote . Reply STOP to opt out."\n}`,
    options: {},
  },
  name: "Follow-up SMS", type: "n8n-nodes-base.httpRequest", typeVersion: 4.2, position: [780, 220],
  credentials: OPENPHONE_CRED, continueOnFail: true,
};
const fEmail = {
  parameters: {
    method: "POST", url: "https://api.resend.com/emails",
    authentication: "genericCredentialType", genericAuthType: "httpHeaderAuth",
    sendBody: true, specifyBody: "json",
    jsonBody: `={\n  "from": "Toro Movers <hello@toromovers.net>",\n  "to": ["{{ $('Find contact').first().json.results[0].properties.email }}"],\n  "subject": "We tried to reach you — Toro Movers",\n  "html": "<p>Hi ${fn}, we just tried calling about your move and missed you. Reply to this email, call <a href=\\"tel:+16896002720\\">(689) 600-2720</a>, or grab your up-front quote here: <a href=\\"https://toromovers.net/quote\\">toromovers.net/quote</a>.</p><p>— Toro Movers · Family-owned · Insured · Hablamos espanol</p>"\n}`,
    options: {},
  },
  name: "Follow-up Email", type: "n8n-nodes-base.httpRequest", typeVersion: 4.2, position: [980, 220],
  credentials: RESEND_CRED, continueOnFail: true,
};
wf.nodes.push(ifNoAns, fSms, fEmail);

// 3) rewire: Update contact → No answer?; true → SMS → Email → Respond; false → Respond
wf.connections["Update contact"] = { main: [[{ node: "No answer?", type: "main", index: 0 }]] };
wf.connections["No answer?"] = { main: [
  [{ node: "Follow-up SMS", type: "main", index: 0 }],
  [{ node: "Respond", type: "main", index: 0 }],
] };
wf.connections["Follow-up SMS"] = { main: [[{ node: "Follow-up Email", type: "main", index: 0 }]] };
wf.connections["Follow-up Email"] = { main: [[{ node: "Respond", type: "main", index: 0 }]] };

// integrity
const names = new Set(wf.nodes.map((n) => n.name));
for (const [s, v] of Object.entries(wf.connections)) {
  if (!names.has(s)) throw new Error("orphan " + s);
  for (const arr of v.main || []) for (const c of arr || []) if (!names.has(c.node)) throw new Error("bad target " + c.node);
}

const body = { name: wf.name, nodes: wf.nodes.map(({ webhookId, ...r }) => r), connections: wf.connections, settings: wf.settings || {} };
const u = await api(`/workflows/${ID}`, { method: "PUT", body: JSON.stringify(body) });
if (u.status >= 300) throw new Error("PUT failed " + u.status + " " + u.text.slice(0, 200));
await api(`/workflows/${ID}/deactivate`, { method: "POST" });
const a = await api(`/workflows/${ID}/activate`, { method: "POST" });
console.log("No-answer follow-up installed ·", a.status < 300 ? "reactivated ✅" : "activate FAILED " + a.status);
