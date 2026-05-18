# Grace &amp; Co.

Residential care for the homes of Northeast Florida. Marketing site + booking flow.

## Stack
- Next.js 16 (App Router) + TypeScript + Tailwind v4
- Instrument Serif (display) + Inter (body) via `next/font`
- React Hook Form + Zod for booking validation
- Stripe (deposit) — stub at `src/app/api/checkout/route.ts`
- Resend (confirmation email) — stub at `src/app/api/booking/route.ts`
- Netlify deploy (`@netlify/plugin-nextjs`)

## Develop
```bash
npm install
npm run dev
# → http://localhost:3000
```

## Environment
Copy `.env.example` to `.env.local`, fill in keys as they become available.

## Deploy
Pushes to `main` deploy via Netlify (project linked in dashboard).
