"use client";

import { useEffect, useRef, useState } from "react";

// Mapbox-powered address autocomplete biased to Central Florida.
// Requires NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN. Falls back to a plain
// text input (with browser autofill) if the token is missing.

type MapboxFeature = {
  id: string;
  place_name: string;
  text: string;
};

type Suggestion = {
  id: string;
  primary: string;
  full: string;
};

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
  ariaLabel?: string;
};

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
const ORLANDO_PROXIMITY = "-81.3792,28.5383";
// Loose bounding box covering Central Florida + a margin (Orange, Seminole,
// Osceola, Lake, Polk, Volusia). Keeps results local.
const CFL_BBOX = "-82.6,27.4,-80.4,29.4";

export function AddressInput({
  value,
  onChange,
  placeholder,
  autoComplete = "street-address",
  ariaLabel,
}: Props) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const debounceRef = useRef<number | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const fetchSeq = useRef(0);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const fetchSuggestions = async (query: string) => {
    if (!TOKEN) return;
    if (query.trim().length < 3) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    const seq = ++fetchSeq.current;
    const url =
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json` +
      `?access_token=${TOKEN}` +
      `&country=us` +
      `&proximity=${ORLANDO_PROXIMITY}` +
      `&bbox=${CFL_BBOX}` +
      `&types=address,place,locality,neighborhood,postcode` +
      `&autocomplete=true` +
      `&limit=5`;
    try {
      const res = await fetch(url);
      if (!res.ok) return;
      const data: { features?: MapboxFeature[] } = await res.json();
      if (seq !== fetchSeq.current) return; // stale response
      const items: Suggestion[] = (data.features ?? []).map((f) => ({
        id: f.id,
        primary: f.text,
        full: f.place_name,
      }));
      setSuggestions(items);
      setOpen(items.length > 0);
      setActive(-1);
    } catch {
      /* silent — fall back to plain input */
    }
  };

  const onInput = (v: string) => {
    onChange(v);
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => fetchSuggestions(v), 260);
  };

  const select = (s: Suggestion) => {
    onChange(s.full);
    setSuggestions([]);
    setOpen(false);
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" && active >= 0) {
      e.preventDefault();
      select(suggestions[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={wrapRef} className="address-input-wrap">
      <input
        type="text"
        autoComplete={autoComplete}
        inputMode="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onInput(e.target.value)}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        onKeyDown={onKey}
        aria-label={ariaLabel}
        aria-autocomplete="list"
        aria-expanded={open}
      />
      {open && suggestions.length > 0 && (
        <ul className="address-suggestions" role="listbox">
          {suggestions.map((s, i) => (
            <li
              key={s.id}
              role="option"
              aria-selected={i === active}
              className={`address-suggestion${i === active ? " active" : ""}`}
              onMouseDown={(e) => {
                // mousedown so it fires before input blur
                e.preventDefault();
                select(s);
              }}
              onMouseEnter={() => setActive(i)}
            >
              <span className="addr-primary">{s.primary}</span>
              <span className="addr-secondary">{s.full}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
