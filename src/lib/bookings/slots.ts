/**
 * Simple availability for move days.
 * Business hours: Mon–Sat (Sunday on request — hidden by default).
 * Cap: SQUARE_MAX_MOVES_PER_DAY or default 2 scheduled starts per day.
 */

import { listScheduledCountsByDate } from "./store";
import type { TimeSlotId } from "./types";

const AMERICA_NY = "America/New_York";

export function maxMovesPerDay(): number {
  const n = Number(process.env.SQUARE_MAX_MOVES_PER_DAY || "2");
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 2;
}

function ymdInTz(d: Date, timeZone = AMERICA_NY): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

function weekdayInTz(ymd: string, timeZone = AMERICA_NY): number {
  const [y, m, day] = ymd.split("-").map(Number);
  const probe = new Date(Date.UTC(y!, m! - 1, day!, 16, 0, 0));
  const wd = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
  }).format(probe);
  const map: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  return map[wd] ?? 0;
}

export type DayAvailability = {
  date: string;
  weekday: number;
  label: string;
  open: boolean;
  remaining: number;
  slots: TimeSlotId[];
};

export async function buildAvailability(days = 45): Promise<DayAvailability[]> {
  const out: DayAvailability[] = [];
  const start = new Date();
  const max = maxMovesPerDay();
  const allSlots: TimeSlotId[] = ["morning", "afternoon", "full-day"];
  const counts = await listScheduledCountsByDate();

  for (let i = 1; i <= days; i++) {
    const d = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
    const date = ymdInTz(d);
    const weekday = weekdayInTz(date);
    const openDay = weekday >= 1 && weekday <= 6;
    const booked = openDay ? counts.get(date) || 0 : 0;
    const remaining = openDay ? Math.max(0, max - booked) : 0;
    const open = openDay && remaining > 0;

    const label = new Intl.DateTimeFormat("en-US", {
      timeZone: AMERICA_NY,
      weekday: "short",
      month: "short",
      day: "numeric",
    }).format(new Date(`${date}T16:00:00Z`));

    out.push({
      date,
      weekday,
      label,
      open,
      remaining,
      slots: open ? allSlots : [],
    });
  }
  return out;
}
