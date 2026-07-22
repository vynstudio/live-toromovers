# Global lead form popup

Same UX across:

| Host | Codebase | Popup |
|------|----------|--------|
| **toromovers.net** | `toromovers-site` | `QuoteModal` + `GlobalLeadForm` |
| **toromoveit.com** (legacy) | 301 → toromovers.net | See `docs/domain-consolidation.md` |
| **go.toromovers.net** | same as toromoveit (alias) | same |

## Behavior
- CTAs open a **mobile-first bottom sheet** (desktop centered card)
- Fields: name, phone, email (optional), move date, service pills, property pills
- Submit → CRM (`/api/crm/lead` on main site; ads LP → `/api/lead` → main intake)
- Escape / backdrop / × closes modal
- Sticky bar hides while modal open

## Open the modal
```js
import { openQuote } from "@/lib/open-quote";
openQuote({ source: "hero", serviceType: "Full-service move" });
```

Or markup:
```html
<a href="#quote" data-open-quote data-source="hero">Get free quote</a>
```

Deep booking wizard remains at `/quote` (multi-step). Primary marketing CTAs use the popup.
