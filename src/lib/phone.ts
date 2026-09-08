/**
 * US customer phone parsing for Get My Price.
 *
 * Digits stay in typed order. A leading 1 is the country code, never the
 * start of the area code. The (XXX) XXX-XXXX mask applies only once a
 * complete NANP number exists. Submit value is E.164: +1XXXXXXXXXX.
 */

export type UsPhoneReason =
  | "empty"
  | "ok"
  | "too_short"
  | "too_long"
  | "letters"
  | "invalid";

export type UsPhoneParsed = {
  /** Digit characters in typed order. Never reordered. Never truncated. */
  digits: string;
  /** 10-digit NANP national number when complete and valid. */
  national: string | null;
  e164: string | null;
  /** Visible field value. */
  display: string;
  valid: boolean;
  reason: UsPhoneReason;
};

/** NANP: area code first digit 2–9, then 9 more digits. */
const NANP_NATIONAL = /^[2-9]\d{9}$/;

function empty(reason: UsPhoneReason, digits = ""): UsPhoneParsed {
  return {
    digits,
    national: null,
    e164: null,
    display: digits,
    valid: false,
    reason,
  };
}

export function parseUsPhone(raw: string): UsPhoneParsed {
  const input = String(raw ?? "");
  if (/[A-Za-z]/.test(input)) {
    return {
      digits: input.replace(/\D/g, ""),
      national: null,
      e164: null,
      display: input,
      valid: false,
      reason: "letters",
    };
  }

  const digits = input.replace(/\D/g, "");
  if (!digits) return empty("empty");

  if (digits.length > 11) return empty("too_long", digits);

  let national: string;
  if (digits.length === 11) {
    if (!digits.startsWith("1")) return empty("too_long", digits);
    national = digits.slice(1);
  } else if (digits.startsWith("1") && digits.length === 10) {
    // Country code of an incomplete +1 number. Do not treat 1321758009 as NANP.
    return empty("too_short", digits);
  } else {
    national = digits;
  }

  if (NANP_NATIONAL.test(national)) {
    return {
      digits,
      national,
      e164: `+1${national}`,
      display: `(${national.slice(0, 3)}) ${national.slice(3, 6)}-${national.slice(6)}`,
      valid: true,
      reason: "ok",
    };
  }

  if (national.length > 10) return empty("too_long", digits);
  if (national.length === 10) return empty("invalid", digits);
  return empty("too_short", digits);
}

export function toUsE164(raw: string | null | undefined): string | null {
  if (!raw) return null;
  return parseUsPhone(raw).e164;
}

export function countDigitsBefore(value: string, caret: number): number {
  const end = Math.max(0, Math.min(caret, value.length));
  let n = 0;
  for (let i = 0; i < end; i++) {
    const c = value.charCodeAt(i);
    if (c >= 48 && c <= 57) n++;
  }
  return n;
}

export function caretFromDigitIndex(display: string, digitIndex: number): number {
  if (digitIndex <= 0) return 0;
  let seen = 0;
  for (let i = 0; i < display.length; i++) {
    const c = display.charCodeAt(i);
    if (c >= 48 && c <= 57) {
      seen++;
      if (seen === digitIndex) return i + 1;
    }
  }
  return display.length;
}

export function phoneValidationMessage(
  reason: UsPhoneReason,
  es: boolean,
): string {
  if (es) {
    if (reason === "letters") return "Ingrese solo números de teléfono.";
    if (reason === "too_long") {
      return "Use 10 dígitos, o 11 con código de país 1.";
    }
    if (reason === "invalid") return "Ingrese un teléfono móvil de EE. UU. válido.";
    return "Ingrese un teléfono de 10 dígitos.";
  }
  if (reason === "letters") return "Enter a phone number, not letters.";
  if (reason === "too_long") {
    return "Enter a 10-digit US number, or 11 digits with country code 1.";
  }
  if (reason === "invalid") return "Enter a valid US mobile number.";
  return "Enter a 10-digit US phone number.";
}
