# Central Florida city-page cluster rollout

## Batch 1 — gold polish live (2026-07-25)

| Page | Agent | Status |
|------|-------|--------|
| `/altamonte-springs-movers` | QA gold standard | full + polish checklist |
| `/winter-park-movers` | polish to gold | full + Best-for, schema, hub, no ClosingCta |
| `/maitland-movers` | polish to gold | full + Best-for, schema, hub, no ClosingCta |
| `/fern-park-movers` | polish to gold | full + Best-for, schema, hub, no ClosingCta |
| `/lake-mary-movers` | polish to gold | full + Best-for, schema, hub, no ClosingCta |
| `/sanford-movers` | polish to gold | full + Best-for, schema, hub, no ClosingCta |

**Gold checklist:** trust row · Best-for · pricing factors (no $) · hard CTA · Name — note nearby · hub link · LocalBusiness+MovingCompany+Service+FAQ+Breadcrumb · no fake office · single local close CTA

Template reference: `src/app/(site)/altamonte-springs-movers/page.tsx`

Shared elements: H1 `[City] Movers`, trust row, 8 H2 sections, service subsections, cost, included, franchise contrast, nearby, 7 FAQs, FAQPage + MovingCompany schema (Orlando base only), CTA Get my free estimate + (321) 758-0094.

## Batch 2 — gold live (2026-07-25)

| Page | Status |
|------|--------|
| `/apopka-movers` | full long-form gold |
| `/oviedo-movers` | full long-form gold |
| `/kissimmee-movers` | full long-form gold (deeper) |
| `/winter-garden-movers` | full long-form gold |
| `/windermere-movers` | full long-form gold |
| `/st-cloud-movers` | full long-form gold |  

## Batch 3 — gold live (2026-07-25)

| Page | Status |
|------|--------|
| `/clermont-movers` | full long-form gold |
| `/davenport-movers` | full long-form gold |
| `/lakeland-movers` | full long-form gold |
| `/winter-haven-movers` | full long-form gold |

**All 16 city cluster pages complete** (batches 1–3).  

## Hubs

- `/central-florida-movers` — regional overview + link to service-areas
- `/service-areas` — **live** authority hub: all 16+ city pages by region, services, ItemList schema, FAQ

## Internal link rules

Every local page: Orlando hub, Central Florida hub, apartment movers, rates guide, hidden fees guide, 2–3 nearby cities, get-my-price.
