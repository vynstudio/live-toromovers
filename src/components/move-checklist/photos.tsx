"use client";

import { useState } from "react";
import type { UploadedRef } from "@/lib/move-checklist/model";

const MAX_BYTES = 1_800_000;
const MAX_EDGE = 1600;

async function compress(file: File): Promise<{ blob: Blob; name: string; type: string }> {
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml") {
    if (file.size > MAX_BYTES) throw new Error("File is too large (keep under 1.5 MB).");
    return { blob: file, name: file.name, type: file.type || "application/octet-stream" };
  }
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not process image.");
  ctx.drawImage(bitmap, 0, 0, w, h);
  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Could not compress image."))),
      "image/jpeg",
      0.72,
    );
  });
  if (blob.size > MAX_BYTES) throw new Error("Photo is still too large. Try a closer crop.");
  return { blob, name: file.name.replace(/\.[^.]+$/, "") + ".jpg", type: "image/jpeg" };
}

async function toBase64(blob: Blob): Promise<string> {
  const buf = await blob.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

export async function uploadFiles(files: FileList | File[]): Promise<UploadedRef[]> {
  const out: UploadedRef[] = [];
  for (const file of Array.from(files)) {
    const compressed = await compress(file);
    const data = await toBase64(compressed.blob);
    const res = await fetch("/api/move-checklist/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filename: compressed.name,
        contentType: compressed.type,
        data,
      }),
    });
    const json = (await res.json().catch(() => null)) as
      | { ok?: boolean; file?: UploadedRef; error?: string }
      | null;
    if (!res.ok || !json?.file) {
      throw new Error(json?.error || "Upload failed. Try a smaller photo.");
    }
    out.push(json.file);
  }
  return out;
}

export function PhotoPicker({
  label,
  files,
  max = 3,
  onChange,
}: {
  label: string;
  files: UploadedRef[];
  max?: number;
  onChange: (next: UploadedRef[]) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function onPick(list: FileList | null) {
    if (!list?.length) return;
    setErr("");
    setBusy(true);
    try {
      const room = Math.max(0, max - files.length);
      const slice = Array.from(list).slice(0, room);
      const uploaded = await uploadFiles(slice);
      onChange([...files, ...uploaded]);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mdc-photos">
      <span className="mdc-label">{label}</span>
      {files.length ? (
        <ul className="mdc-photo-list">
          {files.map((f) => (
            <li key={f.key}>
              <span>{f.filename}</span>
              <button
                type="button"
                className="mdc-link"
                onClick={() => onChange(files.filter((x) => x.key !== f.key))}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {files.length < max ? (
        <label className="mdc-upload">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic,application/pdf"
            multiple
            disabled={busy}
            onChange={(e) => {
              void onPick(e.target.files);
              e.target.value = "";
            }}
          />
          {busy ? "Uploading…" : "Add photo"}
        </label>
      ) : null}
      {err ? <p className="mdc-err">{err}</p> : null}
    </div>
  );
}
