"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";

/**
 * Google Places autocomplete (Places API New, REST).
 * Keeps a stable input identity so typing never loses focus.
 */

const KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
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

async function fetchPredictions(
  input: string,
  sessionToken: string,
): Promise<Suggestion[]> {
  if (!KEY) return [];

  const headers = {
    "Content-Type": "application/json",
    "X-Goog-Api-Key": KEY,
    "X-Goog-FieldMask":
      "suggestions.placePrediction.placeId,suggestions.placePrediction.text,suggestions.placePrediction.structuredFormat",
  };

  const bodyBase = {
    input,
    sessionToken,
    includedRegionCodes: ["us"] as string[],
    locationBias: {
      circle: { center: CFL_CENTER, radius: CFL_RADIUS_M },
    },
  };

  // Prefer address-like results; fall back if the API rejects the type filter.
  let res = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
    method: "POST",
    headers,
    body: JSON.stringify({
      ...bodyBase,
      includedPrimaryTypes: ["street_address", "premise", "subpremise", "route"],
    }),
  });

  if (!res.ok) {
    res = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
      method: "POST",
      headers,
      body: JSON.stringify(bodyBase),
    });
  }
  if (!res.ok) return [];

  const data: { suggestions?: { placePrediction?: PlacePrediction }[] } =
    await res.json();
  return (data.suggestions ?? [])
    .map((s) => s.placePrediction)
    .filter((p): p is PlacePrediction => p != null)
    .map((p) => ({
      id: p.placeId,
      primary: p.structuredFormat?.mainText?.text ?? p.text?.text ?? "",
      secondary: p.structuredFormat?.secondaryText?.text ?? "",
      full: p.text?.text ?? "",
    }))
    .filter((s) => s.full || s.primary);
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
  /** Prefer off so browser autofill doesn't fight Places. */
  autoComplete?: string;
  name?: string;
  id?: string;
};

export function GoogleAddressInput({
  value,
  onChange,
  placeholder = "Start typing street…",
  ariaLabel,
  autoComplete = "off",
  name,
  id,
}: Props) {
  const reactId = useId();
  const listId = `${reactId}-list`;
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const debounceRef = useRef<number | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const tokenRef = useRef(newToken());
  const fetchSeq = useRef(0);
  // Keep latest onChange without re-binding effect deps
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    const onDocPointer = (e: Event) => {
      const t = e.target as Node | null;
      if (wrapRef.current && t && !wrapRef.current.contains(t)) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", onDocPointer, true);
    return () => document.removeEventListener("pointerdown", onDocPointer, true);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, []);

  const runFetch = async (query: string) => {
    if (!KEY || query.trim().length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    const seq = ++fetchSeq.current;
    try {
      const items = await fetchPredictions(query, tokenRef.current);
      if (seq !== fetchSeq.current) return;
      // Don't steal focus — only update list
      setSuggestions(items);
      setOpen(items.length > 0 && document.activeElement === inputRef.current);
      setActive(-1);
    } catch {
      /* plain input still works */
    }
  };

  const handleChange = (v: string) => {
    onChangeRef.current(v);
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      void runFetch(v);
    }, 200);
  };

  const select = (s: Suggestion) => {
    const full = s.full || s.primary;
    onChangeRef.current(full);
    setSuggestions([]);
    setOpen(false);
    setActive(-1);
    tokenRef.current = newToken();
    // Restore focus after selection so user can keep editing unit, etc.
    requestAnimationFrame(() => inputRef.current?.blur());
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      // Never submit the outer form while the user is in this field
      // unless they're confirming a highlighted suggestion.
      if (open && suggestions.length > 0) {
        e.preventDefault();
        e.stopPropagation();
        if (active >= 0 && active < suggestions.length) {
          select(suggestions[active]);
        } else if (suggestions[0]) {
          select(suggestions[0]);
        }
        return;
      }
      // Allow Enter to move on — parent form handles submit/continue
      return;
    }
    if (!open || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      setActive(-1);
    }
  };

  return (
    <div ref={wrapRef} className="address-input-wrap">
      <input
        ref={inputRef}
        id={id}
        name={name}
        type="text"
        // "off" / "new-password" quirks — use street-address disabled via off
        autoComplete={autoComplete}
        autoCorrect="off"
        autoCapitalize="words"
        spellCheck={false}
        placeholder={placeholder}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => {
          if (suggestions.length > 0) setOpen(true);
        }}
        onKeyDown={onKey}
        aria-label={ariaLabel}
        aria-autocomplete="list"
        aria-controls={listId}
        aria-expanded={open}
        role="combobox"
      />
      {open && suggestions.length > 0 && (
        <ul id={listId} className="address-suggestions" role="listbox">
          {suggestions.map((s, i) => (
            <li
              key={s.id}
              role="option"
              aria-selected={i === active}
              className={`address-suggestion${i === active ? " active" : ""}`}
              // pointerdown + preventDefault keeps input from blurring before select on mobile
              onPointerDown={(e) => {
                e.preventDefault();
                select(s);
              }}
              onMouseEnter={() => setActive(i)}
            >
              <span className="addr-primary">{s.primary || s.full}</span>
              {s.secondary ? (
                <span className="addr-secondary">{s.secondary}</span>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
