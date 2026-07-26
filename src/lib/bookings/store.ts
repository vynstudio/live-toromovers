/**
 * Reservation storage via Netlify Blobs.
 * Fails closed on write when Blobs unavailable in production-like deploys;
 * local `next dev` without Blobs uses a process memory fallback so UI is testable.
 */

import { getStore } from "@netlify/blobs";
import type { BookingRecord } from "./types";

const STORE = "bookings";
const mem = new Map<string, BookingRecord>();

function useMemoryOnly() {
  return process.env.BOOKINGS_MEMORY === "1" || process.env.NODE_ENV === "test";
}

async function blobStore() {
  if (useMemoryOnly()) return null;
  try {
    return getStore(STORE);
  } catch {
    return null;
  }
}

export async function saveBooking(rec: BookingRecord): Promise<void> {
  rec.updatedAt = new Date().toISOString();
  mem.set(rec.id, rec);
  const store = await blobStore();
  if (store) {
    await store.setJSON(rec.id, rec);
  } else if (process.env.NODE_ENV === "production" && !useMemoryOnly()) {
    console.warn(
      "[bookings] Netlify Blobs unavailable — reservation only in memory this instance",
    );
  }
}

export async function getBooking(id: string): Promise<BookingRecord | null> {
  if (!id) return null;
  const store = await blobStore();
  if (store) {
    try {
      const fromBlob = (await store.get(id, { type: "json" })) as BookingRecord | null;
      if (fromBlob?.id) {
        mem.set(id, fromBlob);
        return fromBlob;
      }
    } catch {
      /* fall through */
    }
  }
  return mem.get(id) || null;
}

export async function updateBooking(
  id: string,
  patch: Partial<BookingRecord>,
): Promise<BookingRecord | null> {
  const cur = await getBooking(id);
  if (!cur) return null;
  const next: BookingRecord = {
    ...cur,
    ...patch,
    id: cur.id,
    updatedAt: new Date().toISOString(),
  };
  await saveBooking(next);
  return next;
}

/** List bookings that share a calendar day (for capacity). Best-effort scan. */
export async function listScheduledOnDate(
  ymd: string,
): Promise<BookingRecord[]> {
  const all = await listAllBookings();
  return all.filter(
    (rec) =>
      rec.moveDate === ymd &&
      (rec.status === "scheduled" || rec.status === "paid"),
  );
}

/** One blob list pass → counts by moveDate for open capacity. */
export async function listScheduledCountsByDate(): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  const all = await listAllBookings();
  for (const rec of all) {
    if (
      rec.moveDate &&
      (rec.status === "scheduled" || rec.status === "paid")
    ) {
      counts.set(rec.moveDate, (counts.get(rec.moveDate) || 0) + 1);
    }
  }
  return counts;
}

async function listAllBookings(): Promise<BookingRecord[]> {
  const store = await blobStore();
  const out: BookingRecord[] = [];
  const seen = new Set<string>();

  if (store) {
    try {
      const listed = await store.list();
      for (const blob of listed.blobs || []) {
        const rec = (await store.get(blob.key, {
          type: "json",
        })) as BookingRecord | null;
        if (rec?.id) {
          out.push(rec);
          seen.add(rec.id);
          mem.set(rec.id, rec);
        }
      }
    } catch {
      /* fall through */
    }
  }

  for (const rec of mem.values()) {
    if (!seen.has(rec.id)) out.push(rec);
  }
  return out;
}
