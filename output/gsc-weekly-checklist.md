# Toro Movers — Checklist semanal (GSC / GA4 / ranking / técnico)

> Correcciones vs. el borrador inicial: GSC **no tiene** pestaña "Sets" (es **Performance → Search results**); "Experience" hoy es **Core Web Vitals** (Mobile Usability fue retirada por Google en 2023 — usar **PageSpeed Insights** para móvil).

## Google Search Console
- [ ] **Indexing → Pages**: confirmar que estas 8 URLs nuevas están **Indexed** (y revisar "Not indexed" → motivo):
  - `/central-florida-movers`
  - `/apartment-movers` · `/residential-movers` · `/commercial-movers` · `/packing-services` · `/loading-unloading`
  - `/maitland-movers` · `/davenport-movers`
- [ ] Tras el deploy: **Sitemaps** → reenviar `https://toromovers.net/sitemap.xml`; pedir indexación (URL Inspection → Request indexing) de las 8 URLs nuevas.
- [ ] **Performance → Search results**: clicks, impresiones, posición media **por página** y **por query**. Anotar qué keywords traen tráfico.
- [ ] **Experience → Core Web Vitals**: sin URLs en "Poor". (Móvil: cruzar con PageSpeed Insights.)
- [ ] **Enhancements**: validar el fix del issue de **Review snippets** ("Validate fix"); revisar **FAQ** / **Breadcrumbs** sin errores.
- [ ] **Sitemaps / crawl stats**: sin errores de sitemap ni de rastreo.

## GA4
- [ ] **Realtime**: abrir el sitio y confirmar que se disparan:
  - [ ] `phone_click` al hacer clic en el teléfono.
  - [ ] `quote_click` al hacer clic en "Get my price" / botones a `/quote`.
- [ ] **Reports → Traffic acquisition**: qué páginas/ciudades traen más tráfico orgánico.
- [ ] (Opcional) marcar `quote_click` y `generate_lead` como **conversiones** en GA4.

## Ranking (manual o herramienta)
- [ ] Buscar y anotar posición orgánica + local pack (GBP):
  - "Central Florida movers", "Orlando movers", "apartment movers Orlando"
  - "[city] movers" para las 14 ciudades.
- [ ] Verificar que la GBP aparezca en el local pack para Orlando + ciudades core.

## Técnico (semanal o antes de cada deploy)
- [ ] `npm run build` y `tsc --noEmit` sin errores.
- [ ] Ninguna página con 500 / 404 (revisar las 20 indexables).
- [ ] Canonical correcto por página (apuntando a `toromovers.net`, no a `.netlify.app`).
- [ ] Todas las city pages, service pages, home y hub tienen **FAQs + FAQPage schema**.
- [ ] Sin contenido duplicado entre city pages (cada una con H1, barrios y ángulo local únicos).
- [ ] Titles ≤60 chars, metas ≤160, un solo H1 por página.
