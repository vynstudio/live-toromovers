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
- If Netlify cloud build is blocked (credit usage), local CLI deploy with auth still works

## Move-day form (crew intake)
- **Canonical URL:** `/move-details` (https://toromovers.net/move-details)
- Legacy: `/movingday-checklist`; `/intake` redirects to checklist
- POST `/api/intake` → Resend + **one** Telegram message (`buildTelegramText` — never multi-part)
- Services only: `full-service` (truck+crew), `labor-only`. No storage / load-only / pack+move
- No HOA or COI fields on the form
- Address: `GoogleAddressInput` + `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` (Places API New)
- Sticky CTA hidden on move-details / movingday-checklist / intake
- **Do not** put `/move-details` in `next.config.ts` `AD_LANDING_PATHS` (was redirecting to get-my-price)
- **Do not** define form field components inside the parent render (remounts inputs / focus loss while typing)
