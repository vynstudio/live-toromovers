#!/usr/bin/env node
/**
 * Write interactive booking email HTML previews to public/email-preview/
 * Open: https://toromovers.net/email-preview/book-online.html
 *
 *   node scripts/preview-booking-emails.mjs
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT = join(ROOT, "public", "email-preview");

// Dynamic import of compiled path won't work for TS — inline a tiny Node port
// by spawning tsx isn't guaranteed. Instead import via jiti-less: duplicate shell
// by reading the built logic through a simple HTTP-free reimplementation for preview.

// Use dynamic import of the .ts via experimental? Safer: write previews by
// calling the same module through next isn't available. We'll import using
// node --experimental-strip-types if available, else fallback require path.

async function loadBuilder() {
  try {
    // Next 16 / Node 22 may strip types
    const mod = await import(
      pathToFileURL(join(ROOT, "src/lib/crm/email-templates.ts")).href
    );
    return mod.buildBookingEmail;
  } catch (e) {
    console.error("Could not import email-templates.ts:", e.message);
    console.error("Try: node --experimental-strip-types scripts/preview-booking-emails.mjs");
    process.exit(1);
  }
}

const kinds = [
  "quote_received",
  "book_online",
  "booked_confirm",
  "checklist_reminder",
];

const buildBookingEmail = await loadBuilder();
mkdirSync(OUT, { recursive: true });

const indexLinks = [];

for (const kind of kinds) {
  for (const lang of ["en", "es"]) {
    const built = buildBookingEmail(kind, {
      firstName: "Maria",
      moveDate: "Friday, Aug 15",
      lang,
    });
    const file = `${kind}-${lang}.html`;
    writeFileSync(join(OUT, file), built.html, "utf8");
    indexLinks.push({ kind, lang, file, subject: built.subject });
    console.log("wrote", file, "—", built.subject);
  }
}

const index = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Toro Movers — Email previews</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 640px; margin: 40px auto; padding: 0 20px; color: #0a0a0a; }
    h1 { font-size: 1.4rem; }
    a { color: #C8102E; font-weight: 600; }
    li { margin: 10px 0; }
    .sub { color: #5c6370; font-size: 0.9rem; }
  </style>
</head>
<body>
  <h1>Toro Movers — booking email previews</h1>
  <p class="sub">Interactive HTML templates (Book → Deposit → Checklist). Click to open.</p>
  <ul>
    ${indexLinks
      .map(
        (l) =>
          `<li><a href="./${l.file}">${l.kind} · ${l.lang.toUpperCase()}</a><br /><span class="sub">${l.subject.replace(/</g, "&lt;")}</span></li>`,
      )
      .join("\n")}
  </ul>
</body>
</html>`;

writeFileSync(join(OUT, "index.html"), index, "utf8");
console.log("\nPreview index:", join(OUT, "index.html"));
