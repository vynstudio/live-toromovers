// Generates public/central-florida-moving-checklist.pdf — the lead-magnet asset
// delivered by the /central-florida-moving-checklist funnel.
//
// Zero dependencies: writes a valid PDF by hand (Helvetica / Helvetica-Bold,
// WinAnsi encoding). Re-run after editing CONTENT below:
//   node scripts/gen-checklist-pdf.mjs
//
// Keep it in sync with the on-page checklist (src/app/checklist/page.tsx).

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, "../public/central-florida-moving-checklist.pdf");

const TITLE = "The Central Florida Moving Checklist";
const SUBTITLE = "Plan your move • Pack faster • Get an accurate quote";
const FOOTER =
  "Toro Movers • Family-owned • Insured • Bilingual • (689) 600-2720 • toromovers.net";

const CONTENT = [
  { h: "1 week before", items: [
    "Give written notice to your HOA / building — reserve the elevator and a loading zone.",
    "Confirm utility transfer dates (power, water, internet) at both addresses.",
    "Forward your mail with USPS (usps.com/move) — it takes about 7 business days.",
    "Ask your apartment office if a Certificate of Insurance (COI) is required.",
    "Line up a sitter for kids or pets on moving day.",
  ]},
  { h: "3 days before", items: [
    "Start packing non-essentials. Label every box: room + two words of contents.",
    "Use up perishables; defrost the freezer 24 hours before move day.",
    "Confirm your crew arrival window with Toro Movers.",
    "Photograph how electronics are wired for fast reassembly.",
    "Set aside a valuables box you carry yourself — documents, jewelry, meds, hard drives.",
  ]},
  { h: "Florida heat & move-day comfort", items: [
    "Pack a cooler with water and electrolytes — Central Florida moves run hot and humid.",
    "Move heat-sensitive items (candles, electronics, meds) in your own A/C car.",
    "Keep box fans handy and unpacked until the last load.",
    "Start early to beat the afternoon heat and summer storms.",
  ]},
  { h: "Day before", items: [
    "Pack a ‘first night’ bag per person: clothes, toiletries, charger, meds.",
    "Pack a ‘first morning’ kit: coffee, mugs, toilet paper, soap, towels.",
    "Empty drawers of breakables and liquids (the dresser can stay packed).",
    "Disassemble what you can: bed frames, large mirrors — or ask the crew.",
  ]},
  { h: "Morning of", items: [
    "Clear walkways, stairs, and hallways of anything underfoot.",
    "Secure pets in one closed room with food and water.",
    "Final walkthrough: closets, attic, garage, behind doors.",
    "Have cash ready for tips ($20–40 per mover for a good local move).",
  ]},
  { h: "What to have ready for a fast quote", items: [
    "Pickup and drop-off addresses, with unit and floor.",
    "Move type (apartment / house / commercial) and rough size.",
    "Stairs or elevator at each address.",
    "Preferred date and arrival window.",
    "Any large or awkward items (piano, safe, gym equipment).",
  ]},
];

const CTA = "Ready for an up-front hourly price? Get a quote at toromovers.net/quote";

// ---- layout constants (Letter) ----
const PW = 612, PH = 792;
const ML = 56, MR = 56, MB = 64;
const USABLE = PW - ML - MR;
const RED = "0.784 0.063 0.180"; // #C8102E

// crude Helvetica width: average glyph ~0.5em (good enough for wrapping short lines)
const wrap = (text, size, maxW) => {
  const words = text.split(" ");
  const lines = [];
  let line = "";
  const width = (s) => s.length * size * 0.5;
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (width(next) > maxW && line) { lines.push(line); line = w; }
    else line = next;
  }
  if (line) lines.push(line);
  return lines;
};

// Map smart punctuation to its single-byte WinAnsi code point so Buffer
// 'latin1' writes the correct glyph byte (the font uses WinAnsiEncoding).
const WIN = {
  "•": "\x95", // bullet
  "–": "\x96", // en dash
  "—": "\x97", // em dash
  "‘": "\x91", "’": "\x92", // single curly quotes
  "“": "\x93", "”": "\x94", // double curly quotes
  "…": "\x85", // ellipsis
};
const win = (s) => s.replace(/[‘’“”–—•…]/g, (c) => WIN[c]);
const esc = (s) => win(s).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");

// Build draw ops paginated. Each op renders text at an absolute y.
const pages = [];
let ops = [];
let y = 0;

const newPage = (first) => {
  if (ops.length) pages.push(ops);
  ops = [];
  if (first) {
    // red header band
    ops.push(`${RED} rg 0 ${PH - 96} ${PW} 96 re f`);
    ops.push(`BT /F2 22 Tf 1 1 1 rg ${ML} ${PH - 50} Td (${esc(TITLE)}) Tj ET`);
    ops.push(`BT /F1 12 Tf 1 1 1 rg ${ML} ${PH - 72} Td (${esc(SUBTITLE)}) Tj ET`);
    y = PH - 96 - 34;
  } else {
    ops.push(`BT /F2 11 Tf ${RED} rg ${ML} ${PH - 48} Td (The Central Florida Moving Checklist) Tj ET`);
    y = PH - 78;
  }
};

const ensure = (need) => { if (y - need < MB) newPage(false); };

newPage(true);

for (const sec of CONTENT) {
  ensure(40);
  y -= 8;
  ops.push(`BT /F2 13 Tf ${RED} rg ${ML} ${y} Td (${esc(sec.h.toUpperCase())}) Tj ET`);
  y -= 20;
  for (const item of sec.items) {
    const lines = wrap(item, 10.5, USABLE - 16);
    ensure(lines.length * 15 + 2);
    // checkbox-style bullet
    ops.push(`0.12 0.12 0.12 rg ${ML} ${y - 1} 8 8 re S`);
    lines.forEach((ln, i) => {
      ops.push(`BT /F1 10.5 Tf 0.16 0.16 0.18 rg ${ML + 16} ${y - (i * 15)} Td (${esc(ln)}) Tj ET`);
    });
    y -= lines.length * 15 + 6;
  }
}

// CTA box
ensure(54);
y -= 10;
ops.push(`${RED} rg ${ML} ${y - 30} ${USABLE} 38 re f`);
ops.push(`BT /F2 11.5 Tf 1 1 1 rg ${ML + 16} ${y - 12} Td (${esc(CTA)}) Tj ET`);
y -= 50;

// footer on every page
const finalize = () => {
  if (ops.length) pages.push(ops);
  return pages.map((p) => [
    ...p,
    `BT /F1 8.5 Tf 0.45 0.45 0.48 rg ${ML} 40 Td (${esc(FOOTER)}) Tj ET`,
  ]);
};
const rendered = finalize();

// ---- assemble PDF ----
const objs = [];
const add = (s) => { objs.push(s); return objs.length; };

const catalogId = add(null);   // 1
const pagesId = add(null);     // 2
const fontF1 = add(`<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>`);
const fontF2 = add(`<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>`);

const pageIds = [];
for (const content of rendered) {
  const stream = content.join("\n");
  const len = Buffer.byteLength(stream, "latin1");
  const contentId = add(`<< /Length ${len} >>\nstream\n${stream}\nendstream`);
  const pageId = add(null);
  pageIds.push({ pageId, contentId });
}

objs[catalogId - 1] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`;
objs[pagesId - 1] =
  `<< /Type /Pages /Count ${pageIds.length} /Kids [${pageIds.map((p) => `${p.pageId} 0 R`).join(" ")}] >>`;
for (const { pageId, contentId } of pageIds) {
  objs[pageId - 1] =
    `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${PW} ${PH}] ` +
    `/Resources << /Font << /F1 ${fontF1} 0 R /F2 ${fontF2} 0 R >> >> /Contents ${contentId} 0 R >>`;
}

// serialize with xref
let pdf = Buffer.from("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n", "latin1");
const offsets = [];
objs.forEach((body, i) => {
  offsets[i] = pdf.length;
  pdf = Buffer.concat([pdf, Buffer.from(`${i + 1} 0 obj\n${body}\nendobj\n`, "latin1")]);
});
const xrefStart = pdf.length;
let xref = `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`;
for (const off of offsets) xref += `${String(off).padStart(10, "0")} 00000 n \n`;
xref += `trailer\n<< /Size ${objs.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
pdf = Buffer.concat([pdf, Buffer.from(xref, "latin1")]);

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, pdf);
console.log(`Wrote ${OUT} (${pdf.length} bytes, ${rendered.length} page(s))`);
