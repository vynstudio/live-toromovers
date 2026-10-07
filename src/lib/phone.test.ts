import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  caretFromDigitIndex,
  countDigitsBefore,
  parseUsPhone,
  toUsE164,
} from "./phone";

function typeDigits(sequence: string): string {
  let display = "";
  for (const ch of sequence) {
    display = parseUsPhone(display + ch).display;
  }
  return display;
}

describe("parseUsPhone — acceptance", () => {
  it("types 5555550123 → (555) 555-0123 and +15555550123", () => {
    const display = typeDigits("5555550123");
    assert.equal(display, "(555) 555-0123");
    const parsed = parseUsPhone(display);
    assert.equal(parsed.valid, true);
    assert.equal(parsed.e164, "+15555550123");
    assert.equal(parsed.national, "5555550123");
  });

  it("pastes +1 (555) 555-0123 → (555) 555-0123 and +15555550123", () => {
    const parsed = parseUsPhone("+1 (555) 555-0123");
    assert.equal(parsed.display, "(555) 555-0123");
    assert.equal(parsed.e164, "+15555550123");
    assert.equal(parsed.valid, true);
  });

  it("accepts common input forms", () => {
    for (const raw of [
      "5555550123",
      "(555) 555-0123",
      "555-555-0123",
      "+1 555 555 0123",
      "1-555-555-0123",
      "+15555550123",
    ]) {
      const parsed = parseUsPhone(raw);
      assert.equal(parsed.display, "(555) 555-0123", raw);
      assert.equal(parsed.e164, "+15555550123", raw);
    }
  });

  it("does not treat a leading 1 as the area code", () => {
    const typed = typeDigits("1555555012");
    assert.equal(typed, "1555555012");
    assert.notEqual(typed, "(155) 555-5012");
    const parsed = parseUsPhone(typed);
    assert.equal(parsed.valid, false);
    assert.equal(parsed.e164, null);
    const complete = parseUsPhone(typed + "3");
    assert.equal(complete.display, "(555) 555-0123");
    assert.equal(complete.e164, "+15555550123");
  });

  it("never reorders digits while typing, formatting, or from the screenshot mask", () => {
    const steps: string[] = [];
    let display = "";
    for (const ch of "5555550123") {
      display = parseUsPhone(display + ch).display;
      steps.push(display.replace(/\D/g, ""));
    }
    assert.deepEqual(steps, [
      "5",
      "55",
      "555",
      "5555",
      "55555",
      "555555",
      "5555550",
      "55555501",
      "555555012",
      "5555550123",
    ]);
    assert.equal(parseUsPhone("(555) 555-0123").digits, "5555550123");
    assert.equal(parseUsPhone("(155) 555-5012").digits, "1555555012");
    assert.equal(toUsE164("(155) 555-5012"), null);
  });

  it("does not apply (XXX) XXX-XXXX until the number is complete", () => {
    assert.equal(parseUsPhone("555").display, "555");
    assert.equal(parseUsPhone("5555550").display, "5555550");
    assert.equal(parseUsPhone("555555012").display, "555555012");
    assert.equal(parseUsPhone("5555550123").display, "(555) 555-0123");
  });

  it("rejects letters, too few digits, and too many digits", () => {
    assert.equal(parseUsPhone("555ABC0123").reason, "letters");
    assert.equal(parseUsPhone("555ABC0123").valid, false);
    assert.equal(parseUsPhone("555555012").reason, "too_short");
    assert.equal(parseUsPhone("55555501231").reason, "too_long");
    assert.equal(parseUsPhone("155555501231").reason, "too_long");
    assert.equal(parseUsPhone("55555501231").digits, "55555501231");
    assert.equal(toUsE164("55555501231"), null);
    assert.equal(toUsE164("abc"), null);
  });
});

describe("caret helpers", () => {
  it("maps caret through formatting characters without dropping digits", () => {
    const formatted = "(555) 555-0123";
    assert.equal(countDigitsBefore(formatted, 0), 0);
    assert.equal(countDigitsBefore(formatted, 4), 3); // after 5
    assert.equal(countDigitsBefore(formatted, formatted.length), 10);
    assert.equal(caretFromDigitIndex(formatted, 3), 4);
    assert.equal(caretFromDigitIndex(formatted, 10), formatted.length);
  });
});
