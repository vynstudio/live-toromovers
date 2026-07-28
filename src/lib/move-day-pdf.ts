/**
 * Zero-dep PDF builder for moving-day checklist submissions.
 * Helvetica / WinAnsi — good enough for ops printouts.
 */

export type MoveDayPdfData = {
  name: string;
  phone: string;
  email?: string;
  when: string;
  pickup: string;
  dropoff: string;
  size: string;
  packed: string;
  access: string;
  specials: string;
  inventory: string;
  notes?: string;
  crewHint: string;
};

const PW = 612;
const PH = 792;
const ML = 48;
const MR = 48;
const MB = 48;
const RED = "0.784 0.063 0.180";

const WIN: Record<string, string> = {
  "•": "\x95",
  "–": "\x96",
  "—": "\x97",
  "‘": "\x91",
  "’": "\x92",
  "“": "\x93",
  "”": "\x94",
  "…": "\x85",
};

function win(s: string) {
  return s.replace(/[‘’“”–—•…]/g, (c) => WIN[c] || c);
}

function esc(s: string) {
  return win(s)
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function wrap(text: string, size: number, maxW: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  const width = (s: string) => s.length * size * 0.5;
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (width(next) > maxW && line) {
      lines.push(line);
      line = w;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [""];
}

/** Build a one-page (or multi if needed) PDF Buffer. */
export function buildMoveDayPdf(data: MoveDayPdfData): Buffer {
  const usable = PW - ML - MR;
  const ops: string[] = [];
  let y = PH - 40;

  // Header band
  ops.push(`${RED} rg 0 ${PH - 88} ${PW} 88 re f`);
  ops.push(
    `BT /F2 20 Tf 1 1 1 rg ${ML} ${PH - 42} Td (${esc("Moving Day Checklist")}) Tj ET`,
  );
  ops.push(
    `BT /F1 11 Tf 1 1 1 rg ${ML} ${PH - 64} Td (${esc("Toro Movers · crew sheet")}) Tj ET`,
  );
  y = PH - 110;

  const drawLabel = (label: string) => {
    ops.push(
      `BT /F2 9 Tf 0.35 0.35 0.35 rg ${ML} ${y} Td (${esc(label.toUpperCase())}) Tj ET`,
    );
    y -= 14;
  };

  const drawValue = (value: string, size = 11) => {
    const lines = wrap(value || "—", size, usable);
    for (const line of lines) {
      if (y < MB + 20) break;
      ops.push(
        `BT /F1 ${size} Tf 0.05 0.05 0.05 rg ${ML} ${y} Td (${esc(line)}) Tj ET`,
      );
      y -= size + 5;
    }
    y -= 8;
  };

  const field = (label: string, value: string) => {
    drawLabel(label);
    drawValue(value);
  };

  field("Client", data.name);
  field("Phone", data.phone);
  if (data.email) field("Email", data.email);
  field("When", data.when);
  field("Pickup", data.pickup);
  field("Drop-off", data.dropoff);
  field("Home size", data.size);
  field("Packing", data.packed);
  field("Access", data.access);
  field("Specials", data.specials);
  field("Inventory", data.inventory);
  if (data.notes) field("Notes", data.notes);
  field("Crew hint", data.crewHint);

  // Footer
  ops.push(
    `BT /F1 8 Tf 0.45 0.45 0.45 rg ${ML} 28 Td (${esc("Toro Movers · (689) 600-2720 · toromovers.net/move-day-checklist")}) Tj ET`,
  );

  const content = ops.join("\n");
  const contentBuf = Buffer.from(content, "latin1");

  const objects: string[] = [];
  objects.push("1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj\n");
  objects.push("2 0 obj<< /Type /Pages /Kids [3 0 R] /Count 1 >>endobj\n");
  objects.push(
    `3 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PW} ${PH}] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>endobj\n`,
  );
  objects.push(
    `4 0 obj<< /Length ${contentBuf.length} >>stream\n${content}\nendstream\nendobj\n`,
  );
  objects.push(
    "5 0 obj<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>endobj\n",
  );
  objects.push(
    "6 0 obj<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>endobj\n",
  );

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [0];
  for (const obj of objects) {
    offsets.push(Buffer.byteLength(pdf, "latin1"));
    pdf += obj;
  }
  const xrefPos = Buffer.byteLength(pdf, "latin1");
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (let i = 1; i < offsets.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer<< /Size ${objects.length + 1} /Root 1 0 R >>\n`;
  pdf += `startxref\n${xrefPos}\n%%EOF\n`;

  return Buffer.from(pdf, "latin1");
}

export function safePdfFilename(name: string, date: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  const d = date || "move";
  return `moving-day-checklist-${slug || "client"}-${d}.pdf`;
}
