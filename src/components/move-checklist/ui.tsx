"use client";

import type { ReactNode } from "react";

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="mdc-field">
      <span className="mdc-label">{label}</span>
      {hint ? <p className="mdc-hint">{hint}</p> : null}
      {children}
    </div>
  );
}

export function ChoiceGrid({
  options,
  value,
  onChange,
  columns = 2,
  wide,
}: {
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
  columns?: 1 | 2;
  wide?: boolean;
}) {
  return (
    <div className={`mdc-opts mdc-opts-${columns}`}>
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          className={`mdc-opt${wide ? " mdc-opt-wide" : ""}${value === opt ? " on" : ""}`}
          onClick={() => onChange(opt)}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

export function MultiCards({
  options,
  values,
  onToggle,
}: {
  options: readonly string[];
  values: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <div className="mdc-opts mdc-opts-2">
      {options.map((opt) => {
        const on = values.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            className={`mdc-opt mdc-opt-wide${on ? " on" : ""}`}
            onClick={() => onToggle(opt)}
            aria-pressed={on}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

export function TextInput(props: {
  value: string;
  onChange: (v: string) => void;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
  name?: string;
  inputMode?: "text" | "email" | "tel" | "numeric";
}) {
  return (
    <input
      className="mdc-input"
      type={props.type || "text"}
      value={props.value}
      autoComplete={props.autoComplete}
      placeholder={props.placeholder}
      name={props.name}
      inputMode={props.inputMode}
      onChange={(e) => props.onChange(e.target.value)}
    />
  );
}

export function TextArea(props: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      className="mdc-input mdc-textarea"
      value={props.value}
      placeholder={props.placeholder}
      rows={props.rows || 3}
      onChange={(e) => props.onChange(e.target.value)}
    />
  );
}
