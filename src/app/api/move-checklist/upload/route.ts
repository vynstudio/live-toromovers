import { NextResponse } from "next/server";
import { getStore } from "@netlify/blobs";
import { randomUUID } from "crypto";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const MAX = 1_900_000;
const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

function store() {
  const siteID = process.env.NETLIFY_SITE_ID || process.env.SITE_ID;
  const token = process.env.NETLIFY_BLOBS_TOKEN;
  if (siteID && token) {
    return getStore({ name: "move-checklists", siteID, token, consistency: "strong" });
  }
  return getStore({ name: "move-checklists", consistency: "strong" });
}

export async function POST(req: Request) {
  const rl = await rateLimit({
    key: `mdc-up:${clientIp(req)}`,
    limit: 30,
    windowMs: 10 * 60 * 1000,
  });
  if (!rl.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const body = (await req.json().catch(() => null)) as {
    filename?: string;
    contentType?: string;
    data?: string;
  } | null;
  if (!body?.data || !body.filename) {
    return NextResponse.json({ error: "missing_file" }, { status: 400 });
  }
  const contentType = (body.contentType || "application/octet-stream").split(";")[0];
  if (!ALLOWED.has(contentType) && !contentType.startsWith("image/")) {
    return NextResponse.json({ error: "type_not_allowed" }, { status: 400 });
  }
  let buf: Buffer;
  try {
    buf = Buffer.from(body.data, "base64");
  } catch {
    return NextResponse.json({ error: "bad_encoding" }, { status: 400 });
  }
  if (!buf.length || buf.length > MAX) {
    return NextResponse.json({ error: "file_too_large" }, { status: 400 });
  }

  const key = `files/${randomUUID()}`;
  const filename = body.filename.replace(/[^\w.\- ]+/g, "").slice(0, 80) || "upload.bin";
  try {
    const bytes = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
    await store().set(key, bytes as ArrayBuffer, {
      metadata: { filename, contentType, size: String(buf.length) },
    });
  } catch (err) {
    console.error("[move-checklist/upload]", err);
    return NextResponse.json({ error: "store_unavailable" }, { status: 503 });
  }

  return NextResponse.json({
    ok: true,
    file: { key, filename, contentType, size: buf.length },
  });
}
