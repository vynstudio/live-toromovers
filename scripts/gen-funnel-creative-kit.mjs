// Generates a branded "Funnel Ad Copy & Creative Kit" PDF onto the Desktop:
// brand palette swatches + SEO headlines + strong CTAs for both funnels.
// Zero dependencies (hand-written PDF, Helvetica/WinAnsi).
//   node scripts/gen-funnel-creative-kit.mjs

import { writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { resolve } from "node:path";

const OUT = resolve(homedir(), "Desktop", "Toro-Movers-Funnel-Ad-Copy.pdf");

const PALETTE = [
  ["Brand Red", "#C8102E"],
  ["Black", "#0B0B0D"],
  ["White", "#FFFFFF"],
  ["Gold", "#C9A227"],
  ["Navy", "#1B2A52"],
  ["Gray", "#6B6B72"],
];

const FUNNELS = [
  {
    name: "LABOR-ONLY FUNNEL",
    url: "toromovers.net/labor-only-moving",
    headlines: [
      "Labor-Only Movers in Orlando & Central Florida",
      "Loading & Unloading Help — Hourly, Insured Crews",
      "You Bring the Truck. We Bring the Crew.",
      "Need Moving Muscle Today? Hourly Labor in Central FL",
    ],
    subhead:
      "Loading, unloading, stairs & heavy lifting. Up-front hourly pricing — you keep your truck.",
    ctas: ["Get My Hourly Quote", "Check Availability", "Get Labor Help Now", "Call (689) 600-2720"],
  },
  {
    name: "FULL-SERVICE FUNNEL",
    url: "toromovers.net/full-service-moving",
    headlines: [
      "Full-Service Movers in Orlando & Central Florida",
      "Packing, Loading & Moving — Handled Start to Finish",
      "We Pack. We Move. You Relax.",
      "Stress-Free Local Moves Across Central Florida",
    ],
    subhead:
      "Packing, supplies, transport, unloading & setup. Careful insured crew, up-front hourly pricing.",
    ctas: ["Get My Quote", "Request Full-Service Pricing", "Check Availability", "Call (689) 600-2720"],
  },
];

const TRUST = "Family-owned  ·  Fully insured  ·  Bilingual  ·  4.9 on Google  ·  Up-front hourly pricing  ·  Central Florida local";

// ---- PDF primitives ----
const PW = 612, PH = 792, ML = 50, MR = 50, MB = 56;
const USABLE = PW - ML - MR;

const hex = (h) => {
  const n = parseInt(h.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
    .map((v) => v.toFixed(3)).join(" ");
};
const WIN = { "—": "\x97", "–": "\x96", "·": "\xB7", "’": "\x92", "‘": "\x91", "&": "&" };
const win = (s) => s.replace(/[—–·’‘]/g, (c) => WIN[c] || c);
const esc = (s) => win(s).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
const W = (text, size, bold = false) => text.length * size * (bold ? 0.54 : 0.5);

let pages = [], ops = [], y = 0;

const rect = (x, yy, w, h, color, mode = "f") => ops.push(`${color} ${mode === "f" ? "rg" : "RG"} ${x.toFixed(1)} ${yy.toFixed(1)} ${w.toFixed(1)} ${h.toFixed(1)} re ${mode}`);
const txt = (x, yy, s, size, color = "0 0 0", font = "F1") => ops.push(`BT /${font} ${size} Tf ${color} rg ${x.toFixed(1)} ${yy.toFixed(1)} Td (${esc(s)}) Tj ET`);

const BLACK = hex("#0B0B0D"), RED = hex("#C8102E"), WHITE = "1 1 1", INK = hex("#141414"), MUTED = hex("#6B6B72");

const footer = () => txt(ML, 36, "Toro Movers  ·  (689) 600-2720  ·  toromovers.net  ·  Type: Schibsted Grotesk (display) + Inter (body)", 8, MUTED);

const newPage = (first) => {
  if (ops.length) { footer(); pages.push(ops); }
  ops = [];
  if (first) {
    rect(0, PH - 132, PW, 132, BLACK);          // dark header band
    rect(ML, PH - 70, 54, 5, RED);              // red rule
    txt(ML, PH - 40, "TORO · MOVERS", 13, WHITE, "F2");
    txt(ML, PH - 100, "Funnel Ad Copy & Creative Kit", 25, WHITE, "F2");
    txt(ML, PH - 120, "Headlines, CTAs & brand palette — for Meta & Google ad creatives", 11, "0.72 0.72 0.74");
    y = PH - 132 - 40;
  } else {
    y = PH - 56;
  }
};

const ensure = (need) => { if (y - need < MB) newPage(false); };

const sectionLabel = (s) => { ensure(28); txt(ML, y, s, 11.5, RED, "F2"); y -= 7; rect(ML, y, USABLE, 1.2, hex("#E6E6EA")); y -= 16; };

newPage(true);

// ---- PALETTE ----
sectionLabel("BRAND PALETTE");
{
  const cw = (USABLE - 5 * 10) / 6, ch = 42;
  ensure(ch + 30);
  PALETTE.forEach(([nm, hx], i) => {
    const x = ML + i * (cw + 10);
    rect(x, y - ch, cw, ch, hex(hx));
    if (hx === "#FFFFFF") rect(x, y - ch, cw, ch, hex("#D2D2D8"), "S");
    txt(x, y - ch - 13, nm, 8.5, INK, "F2");
    txt(x, y - ch - 24, hx, 8.5, MUTED);
  });
  y -= ch + 24 + 16;
}

// ---- FUNNEL SECTIONS ----
const pill = (x, yy, label) => {
  const w = W(label, 10, true) + 22, h = 22;
  rect(x, yy - h, w, h, RED);
  txt(x + 11, yy - h + 7, label, 10, WHITE, "F2");
  return w;
};

for (const f of FUNNELS) {
  ensure(40);
  sectionLabel(f.name);
  txt(ML, y, f.url, 9.5, MUTED); y -= 22;

  txt(ML, y, "SEO HEADLINES", 9, RED, "F2"); y -= 16;
  for (const h of f.headlines) {
    ensure(18);
    txt(ML + 4, y, h, 13, INK, "F2");
    y -= 19;
  }
  y -= 8;

  ensure(34);
  txt(ML, y, "SUBHEAD", 9, RED, "F2"); y -= 14;
  // wrap subhead
  const words = f.subhead.split(" ");
  let line = "";
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (W(next, 10.5) > USABLE - 8) { txt(ML + 4, y, line, 10.5, hex("#2A2A2A")); y -= 15; line = w; }
    else line = next;
  }
  if (line) { txt(ML + 4, y, line, 10.5, hex("#2A2A2A")); y -= 15; }
  y -= 8;

  ensure(60);
  txt(ML, y, "STRONG CTAs", 9, RED, "F2"); y -= 22;
  let x = ML;
  for (const c of f.ctas) {
    const w = W(c, 10, true) + 22;
    if (x + w > ML + USABLE) { x = ML; y -= 30; ensure(30); }
    pill(x, y, c);
    x += w + 10;
  }
  y -= 34;

  ensure(28);
  txt(ML, y, "TRUST LINE", 9, RED, "F2"); y -= 14;
  // wrap trust
  {
    const ws = TRUST.split(" "); let l = "";
    for (const w of ws) {
      const nx = l ? `${l} ${w}` : w;
      if (W(nx, 9.5) > USABLE - 8) { txt(ML + 4, y, l, 9.5, hex("#3A3A3A")); y -= 13; l = w; }
      else l = nx;
    }
    if (l) { txt(ML + 4, y, l, 9.5, hex("#3A3A3A")); y -= 13; }
  }
  y -= 22;
}

footer();
pages.push(ops);

// ---- assemble ----
const objs = [];
const add = (s) => { objs.push(s); return objs.length; };
const catalogId = add(null), pagesId = add(null);
const f1 = add(`<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>`);
const f2 = add(`<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>`);
const pageIds = [];
for (const content of pages) {
  const stream = content.join("\n");
  const len = Buffer.byteLength(stream, "latin1");
  const cId = add(`<< /Length ${len} >>\nstream\n${stream}\nendstream`);
  pageIds.push({ pageId: add(null), contentId: cId });
}
objs[catalogId - 1] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`;
objs[pagesId - 1] = `<< /Type /Pages /Count ${pageIds.length} /Kids [${pageIds.map((p) => `${p.pageId} 0 R`).join(" ")}] >>`;
for (const { pageId, contentId } of pageIds)
  objs[pageId - 1] = `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${PW} ${PH}] /Resources << /Font << /F1 ${f1} 0 R /F2 ${f2} 0 R >> >> /Contents ${contentId} 0 R >>`;

let pdf = Buffer.from("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n", "latin1");
const offs = [];
objs.forEach((b, i) => { offs[i] = pdf.length; pdf = Buffer.concat([pdf, Buffer.from(`${i + 1} 0 obj\n${b}\nendobj\n`, "latin1")]); });
const xrefStart = pdf.length;
let xref = `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`;
for (const o of offs) xref += `${String(o).padStart(10, "0")} 00000 n \n`;
xref += `trailer\n<< /Size ${objs.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
pdf = Buffer.concat([pdf, Buffer.from(xref, "latin1")]);

writeFileSync(OUT, pdf);
console.log(`Wrote ${OUT} (${pdf.length} bytes, ${pages.length} page(s))`);
