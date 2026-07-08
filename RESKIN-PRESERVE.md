# Reskin Preserve-List & SEO Baseline

**Captured:** 2026-07-08 · **Purpose:** freeze the SEO-critical surface of the live site so a visual reskin (applying the Relume `toromovers-design` system) changes **only presentation** and provably regresses nothing.
**Rule:** anything in this file is *preserve-exactly* unless we deliberately decide otherwise (see "Open decisions").

Stack: **Next.js 16.2.6 (App Router) · React 19 · Tailwind v4 (CSS-first, no config)**. Canonical domain `https://toromovers.net` (`NEXT_PUBLIC_SITE_URL`).

---

## 0. Pre-flight (do before branching)

- [ ] **Resolve 8 uncommitted files** on `main` (see §7) — commit or stash so the reskin branch has a clean diff baseline. SEO-critical among them: `src/lib/content.ts`, `src/lib/guides.ts`, `src/components/guide-page.tsx`.
- [ ] Create branch `reskin/relume-design` off a clean `main`.
- [ ] Confirm the two **Open decisions** below before writing any code.

---

## 1. URL inventory — 37 indexable routes (preserve every path)

Home `/` · `/central-florida-movers` · `/central-florida-moving-checklist` · `/labor-only-moving` · `/full-service-moving` · `/blog` + 8 posts.
**Service pages (5):** `/residential-movers` `/commercial-movers` `/packing-services` `/loading-unloading` `/apartment-movers-orlando-fl`.
**City pages (17):** `/orlando-movers` `/lake-mary-movers` `/winter-park-movers` `/maitland-movers` `/fern-park-movers` `/kissimmee-movers` `/sanford-movers` `/clermont-movers` `/davenport-movers` `/lakeland-movers` `/oviedo-movers` `/winter-garden-movers` `/altamonte-springs-movers` `/apopka-movers` `/st-cloud-movers` `/windermere-movers` `/winter-haven-movers`.

No URL may change. If one ever must, add a 301.

## 2. Metadata (do NOT edit the strings)

- Pattern: **static `export const metadata`** on every page (no `generateMetadata`). Root defaults + `title.template = "%s | Toro Movers"` in `src/app/layout.tsx:44-104`.
- Per-page `title` / `description` strings live in the **data records**, not the JSX:
  - Cities → `src/lib/cities.ts` (`metadata:{title,description}` per record) → template `src/components/city-page.tsx`
  - Services → `src/lib/services.ts` → template `src/components/service-page.tsx`
  - Blog → `src/lib/guides.ts` → template `src/components/guide-page.tsx`
- Every page emits self-referencing `alternates.canonical`, `openGraph`, `twitter:card=summary_large_image`, dynamic `/opengraph-image`, `robots:index,follow`.
- **Reskin must not touch** `cities.ts`, `services.ts`, `guides.ts`, or the `metadata` exports.

## 3. Structured data / JSON-LD (port 1:1, verify byte-identical)

Emitted server-side via `<script type="application/ld+json">`. Emitters:

| File | Pages | @types |
|---|---|---|
| `src/app/layout.tsx:112-193` | all (global `#movingcompany`) | MovingCompany |
| `src/app/page.tsx:26-50` | home | MovingCompany, AggregateRating, Review, Rating, Person, FAQPage, WebSite |
| `src/components/city-page.tsx:46-96` | 17 cities | MovingCompany(#business), BreadcrumbList, FAQPage |
| `src/components/service-page.tsx:21-65` | 4 services | Service, AdministrativeArea, MovingCompany, FAQPage, BreadcrumbList |
| `src/components/guide-page.tsx:97-148` | 8 posts | BlogPosting, Organization, ImageObject, FAQPage, BreadcrumbList |
| `src/app/central-florida-movers/page.tsx:57+` | hub | MovingCompany, AdministrativeArea, FAQPage, BreadcrumbList |
| `src/app/apartment-movers-orlando-fl/page.tsx:109+` | apartment LP | Service, MovingCompany, OpeningHours, AggregateRating, OfferCatalog, Offer, FAQPage, BreadcrumbList |

A reskin changes markup/CSS only — these `<script>` blocks stay as-is.

## 4. Robots / sitemap (dynamic, don't break generation)

- `src/app/robots.ts` → `allow:/`, `disallow:/api/`, sitemap + host. Live: ✓
- `src/app/sitemap.ts` → built from `CITIES`+`SERVICES`+`GUIDES`+hand-listed pages; excludes funnel/noindex routes. Live 37 URLs: ✓

## 5. Redirects & canonicalization (baseline — must still pass post-reskin)

Verified live: `http→https` 301 ✓ · `www→apex` 301 ✓ · trailing-slash→no-slash 308 ✓ · unknown→404 ✓.

Config lives in **`next.config.ts` `redirects()` (:91-110)** and **`netlify.toml` (:12-22)** — reskin does not touch either. Key rules to re-verify after deploy:
- Legacy city slugs → new (301): `/movers-orlando→/orlando-movers`, `/movers-lake-mary→…`, `/movers-winter-park→…`; `/pages/cities/{slug}[.html]→/{slug}` (28 rules); no-page cities → `/central-florida-movers` (301).
- `/apartment-movers → /apartment-movers-orlando-fl` (301).
- Ad LP aliases → `/ads/meta-orlando-movers` (307); `/mudanza→/es/ads/…`; legacy content → `/#…` (307).
- Cross-domain: **`toromudanzas.com` → `toromovers.net` 301** (netlify.toml, force).

⚠️ **Pre-existing issue (NOT reskin-related):** apex `https://toromoveit.com` returns **200** (serves homepage) instead of 301 — canonical-protected (`canonical→toromovers.net`) so low risk, but a real 301 is cleaner. Separate ticket; blocked previously on SSL cert coverage.

## 6. Internal-link graph (preserve — core local-SEO asset)

Homepage links out to `/quote` (×7, funnel), all 17 city pages, all service pages, `/blog`, `/central-florida-moving-checklist`. The reskin's nav/footer/section components must reproduce this link set. Diff internal links before/after.

## 7. Lead funnel — DO NOT TOUCH (behavior-frozen)

Reskin = CSS/markup shell only around these; never change their logic, field flow, or endpoints.

| Component | Endpoint | Mounted on |
|---|---|---|
| `intake-wizard.tsx` | `/api/ad-funnel` | `/quote`, `/get-quote` |
| `step-funnel-form.tsx` | `/api/funnel-lead` | `/full-service-moving`, `/labor-only-moving` |
| `intake-form.tsx` | `/api/intake` | — |
| `quote-form.tsx` | `/api/booking` | (legacy/unmounted) |
| `lead-magnet-form.tsx` | `/api/lead-magnet` | checklist |

API routes (untouched): `api/{ad-funnel,booking,intake,funnel-lead,lead,lead-magnet,checkout,review-request,verify/*}`. Tracking wrappers (untouched): `funnel-tracking`, `thank-you-tracking`, `click-tracking`, `utm-capture`, `analytics`, `track.ts`, `utm.ts`, HubSpot/verify libs. Per funnel-freeze: keep all tracking behind CONFIG guards.

## 8. Styling layer — what the reskin actually changes

- **Tailwind v4 CSS-first:** no config file; `@import "tailwindcss"` at `src/app/globals.css:1`.
- **Tokens:** `src/app/globals.css:3-27` `:root` — already `--red:#C8102E`, `--navy:#1B2A52`, `--gold:#C9A227` + neutrals. **These match the Relume design exactly** → palette needs little/no change.
- **Fonts:** `next/font/google` in `src/app/layout.tsx:22-39` — **Schibsted Grotesk** (display, `--font-serif`) + **Inter** (body, `--font-sans`).
- Visual styling is one large `globals.css` (~2100 lines) + `intake-wizard.module.css`; components use plain className strings (`.btn`, `.city-hero`, `.block`, …). **The reskin lives almost entirely in `globals.css` + section components + the layout font choice.**

---

## Decisions (confirmed 2026-07-08)

1. **Fonts → Raleway** for display headings (add via `next/font/google`, self-hosted at build). Body stays **Inter**. Replaces Schibsted Grotesk site-wide.
2. **Pricing → keep hidden.** Do NOT show the $150/$220/$330 tiers from the Relume design; use "Get my price" cards. `pricing.ts` stays internal-only ("let the client call" strategy).
3. **Scope → homepage-first pilot.** Reskin the homepage on a preview branch, run the §-verification diff, get sign-off, THEN roll to city/service/blog templates.

---

## Verification protocol (before merge)

Run on the preview branch and diff **before vs after** — reskin passes only if SEO surface is identical:
1. Crawl all 37 URLs; assert per-page `title`, `description`, `canonical`, `robots`, `H1`, OG unchanged.
2. Extract every JSON-LD block; assert @types + key fields unchanged (allow only intentional edits).
3. Diff homepage internal-link set (§6) — must be a superset/equal.
4. Re-run redirect matrix (§5) on the deploy preview.
5. Lighthouse home + one city + one blog: **CWV equal or better** (watch LCP — Relume ships 4000×1500 JPGs → must go through `next/image`/WebP).
6. Confirm robots.txt + sitemap.xml still generate all 37 URLs, `/api/` still disallowed.
7. Post-merge: watch **GSC** (source of truth) 1–2 weeks — impressions/positions hold or rise.
