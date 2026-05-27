"use client";

import { useState } from "react";

// Inline month calendar for the /quote wizard — replaces the tiny native
// <input type="date"> with large, readable day cells we fully control. Value
// is a local YYYY-MM-DD string (no UTC drift). Past days are disabled.

type Props = {
  value: string; // selected date as YYYY-MM-DD, or ""
  onChange: (v: string) => void;
  lang?: "en" | "es";
};

const MONTHS_EN = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const MONTHS_ES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const DOW_EN = ["Su","Mo","Tu","We","Th","Fr","Sa"];
const DOW_ES = ["Do","Lu","Ma","Mi","Ju","Vi","Sá"];

const pad = (n: number) => String(n).padStart(2, "0");
const keyOf = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

function parseKey(v: string): { y: number; m: number } | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v);
  return m ? { y: +m[1], m: +m[2] - 1 } : null;
}

export function Calendar({ value, onChange, lang = "en" }: Props) {
  const es = lang === "es";
  const today = new Date();
  const todayKey = keyOf(today.getFullYear(), today.getMonth(), today.getDate());

  const [view, setView] = useState(() => {
    const base = parseKey(value) ?? { y: today.getFullYear(), m: today.getMonth() };
    return base;
  });

  const months = es ? MONTHS_ES : MONTHS_EN;
  const dow = es ? DOW_ES : DOW_EN;

  const firstDow = new Date(view.y, view.m, 1).getDay();
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const atCurrentMonth =
    view.y === today.getFullYear() && view.m === today.getMonth();

  const prev = () => {
    if (atCurrentMonth) return; // never navigate into past months
    setView((v) => (v.m === 0 ? { y: v.y - 1, m: 11 } : { y: v.y, m: v.m - 1 }));
  };
  const next = () =>
    setView((v) => (v.m === 11 ? { y: v.y + 1, m: 0 } : { y: v.y, m: v.m + 1 }));

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="cal">
      <div className="cal-head">
        <button type="button" className="cal-nav" onClick={prev} disabled={atCurrentMonth} aria-label={es ? "Mes anterior" : "Previous month"}>‹</button>
        <span className="cal-title">{months[view.m]} {view.y}</span>
        <button type="button" className="cal-nav" onClick={next} aria-label={es ? "Mes siguiente" : "Next month"}>›</button>
      </div>
      <div className="cal-dow">{dow.map((d) => <span key={d}>{d}</span>)}</div>
      <div className="cal-grid">
        {cells.map((d, i) => {
          if (d === null) return <span key={`b${i}`} className="cal-blank" />;
          const k = keyOf(view.y, view.m, d);
          const past = k < todayKey;
          return (
            <button
              type="button"
              key={k}
              className={`cal-day${value === k ? " on" : ""}${k === todayKey ? " today" : ""}`}
              disabled={past}
              onClick={() => onChange(k)}
            >
              {d}
            </button>
          );
        })}
      </div>
    </div>
  );
}
