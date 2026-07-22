# Domain consolidation — one SEO home

**Organic SEO and paid funnels live on `https://toromovers.net` only.**

## Why

| Host | Role |
|------|------|
| **toromovers.net** | Brand, rankings, reviews, funnels, CRM |
| toromoveit.com | Legacy ad host → **301 → toromovers.net** |
| go.toromovers.net | Legacy ad alias → **301 → toromovers.net** |
| toromudanzas.com | Already 301 → toromovers.net |

A second brand domain (even with `noindex`) still:

- Splits brand / NAP / link equity
- Breaks first-party cookies between ads and SEO pages
- Confuses Meta pixel + CAPI domain matching
- Creates “which site is real?” friction for customers

## Paid traffic destinations (use these in Meta)

| Intent | URL |
|--------|-----|
| Full-service (default) | `https://toromovers.net/full-service-moving` |
| Labor-only | `https://toromovers.net/labor-only-moving` |
| Generic wizard (noindex) | `https://toromovers.net/get-quote` |
| Homepage / organic | `https://toromovers.net/` |

Append UTMs as usual, e.g.

```text
https://toromovers.net/full-service-moving?utm_source=meta&utm_medium=paid_social&utm_campaign=call_fs
```

## Redirect map (legacy hosts)

Configured on the **toro-ads-landing** Netlify project (`netlify.toml`):

| From | To |
|------|----|
| `*/services/full-service` | `/full-service-moving` |
| `*/services/labor-only` | `/labor-only-moving` |
| `*/services/long-distance` | `/full-service-moving` |
| `*/privacy` | `/privacy` |
| `*/es/*` | `/full-service-moving` |
| everything else (`/`, etc.) | `/full-service-moving` |

Query strings (UTMs, `fbclid`, `gclid`) are preserved by Netlify.

## Meta Ads Manager checklist

1. Open each active ad set / ad.
2. Change website URL from `toromoveit.com` or `go.toromovers.net` → `toromovers.net/...` above.
3. Call Now ads: keep phone `(689) 600-2720`; website URL still matters for pixel/view-through.
4. Events Manager: confirm pixel fires on toromovers.net (already installed).
5. After 48h, old domains should only show as 301 in crawls — no content.

## Optional later cleanup

- Move `toromoveit.com` DNS alias onto the **live-toro-site** Netlify project and delete the ads project once redirects are unused.
- Retire the ads repo code; keep only redirects if you still own the domains.
