"use client";

import { useEffect, useRef, useState } from "react";

// Google Places autocomplete via the Places API (New) REST endpoint, called
// directly with fetch (CORS-supported). No Maps JavaScript API needed — only
// "Places API (New)" enabled on the key. Renders a custom dropdown styled like
// .address-suggestions, biased to Central Florida. Falls back to a plain text
// input if the key is missing or a request fails.

const KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
// Bias toward the Orlando metro (50 km = Places API max for a locationBias circle).
const CFL_CENTER = { latitude: 28.5383, longitude: -81.3792 };
const CFL_RADIUS_M = 50000;

type Suggestion = { id: string; primary: string; secondary: string; full: string };

type PlacePrediction = {
  placeId: string;
  text?: { text: string };
  structuredFormat?: {
    mainText?: { text: string };
    secondaryText?: { text: string };
  };
};

async function fetchPredictions(input: string, sessionToken: string): Promise<Suggestion[]> {
  if (!KEY) return [];
  const res = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Goog-Api-Key": KEY },
    body: JSON.stringify({
      input,
      sessionToken,
      includedRegionCodes: ["us"],
      locationBias: { circle: { center: CFL_CENTER, radius: CFL_RADIUS_M } },
    }),
  });
  if (!res.ok) return [];
  const data: { suggestions?: { placePrediction?: PlacePrediction }[] } = await res.json();
  return (data.suggestions ?? [])
    .map((s) => s.placePrediction)
    .filter((p): p is PlacePrediction => p != null)
    .map((p) => ({
      id: p.placeId,
      primary: p.structuredFormat?.mainText?.text ?? p.text?.text ?? "",
      secondary: p.structuredFormat?.secondaryText?.text ?? "",
      full: p.text?.text ?? "",
    }));
}

function newToken(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`;
}

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  autoComplete?: string;
};

export function GoogleAddressInput({
  value,
  onChange,
  placeholder,
  ariaLabel,
  autoComplete = "street-address",
}: Props) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const debounceRef = useRef<number | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const tokenRef = useRef<string>(newToken());
  const fetchSeq = useRef(0);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const runFetch = async (query: string) => {
    if (!KEY || query.trim().length < 3) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    const seq = ++fetchSeq.current;
    try {
      const items = await fetchPredictions(query, tokenRef.current);
      if (seq !== fetchSeq.current) return; // stale response
      setSuggestions(items);
      setOpen(items.length > 0);
      setActive(-1);
    } catch {
      /* no key / request failed — plain input still works */
    }
  };

  const onInput = (v: string) => {
    onChange(v);
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => runFetch(v), 260);
  };

  const select = (s: Suggestion) => {
    onChange(s.full);
    setSuggestions([]);
    setOpen(false);
    tokenRef.current = newToken(); // end this autocomplete session
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
                e.preventDefault();
                select(s);
              }}
              onMouseEnter={() => setActive(i)}
            >
              <span className="addr-primary">{s.primary}</span>
              <span className="addr-secondary">{s.secondary || s.full}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
