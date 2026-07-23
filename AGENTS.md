<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Toro Movers agent notes (2026-07-23)

## Quote funnel (canonical)
- Live path: `/get-my-price` (`LeadCaptureAgent` + `(funnel)/gmp.css`)
- Steps: name+phone → service → ZIPs → size → when → done (3s → `/`)
- Leads: soft then full POST `/api/crm/lead` — no public rates, no email field
- All Get Quote CTAs: `openQuote()` / `QuoteModal` → `/get-my-price`
- Do not resurrect deleted wizards (`intake-wizard`, `quote-form`, `/api/ad-funnel`, `/api/booking`)

## Meta ads
- Image winners only under Full Service Trust; $25/day total; all Final URLs = `/get-my-price`
- Video campaign stays PAUSED unless owner re-authorizes
- Token in `.env.wire` (never commit)

## Deploy
- `npx netlify deploy --prod --build` from repo root; site `live-toro-site` → toromovers.net
