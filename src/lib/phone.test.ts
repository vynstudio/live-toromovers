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
  it("types 3217580094 → (321) 758-0094 and +13217580094", () => {
    const display = typeDigits("3217580094");
    assert.equal(display, "(321) 758-0094");
    const parsed = parseUsPhone(display);
    assert.equal(parsed.valid, true);
    assert.equal(parsed.e164, "+13217580094");
    assert.equal(parsed.national, "3217580094");
  });

  it("pastes +1 (321) 758-0094 → (321) 758-0094 and +13217580094", () => {
    const parsed = parseUsPhone("+1 (321) 758-0094");
    assert.equal(parsed.display, "(321) 758-0094");
    assert.equal(parsed.e164, "+13217580094");
    assert.equal(parsed.valid, true);
  });

  it("accepts common input forms", () => {
    for (const raw of [
      "3217580094",
      "(321) 758-0094",
      "321-758-0094",
      "+1 321 758 0094",
      "1-321-758-0094",
      "+13217580094",
    ]) {
      const parsed = parseUsPhone(raw);
      assert.equal(parsed.display, "(321) 758-0094", raw);
      assert.equal(parsed.e164, "+13217580094", raw);
    }
  });

  it("does not treat a leading 1 as the area code", () => {
    const typed = typeDigits("1321758009");
    assert.equal(typed, "1321758009");
    assert.notEqual(typed, "(132) 175-8009");
    const parsed = parseUsPhone(typed);
    assert.equal(parsed.valid, false);
    assert.equal(parsed.e164, null);
    const complete = parseUsPhone(typed + "4");
    assert.equal(complete.display, "(321) 758-0094");
    assert.equal(complete.e164, "+13217580094");
  });

  it("never reorders digits while typing, formatting, or from the screenshot mask", () => {
    const steps: string[] = [];
    let display = "";
    for (const ch of "3217580094") {
      display = parseUsPhone(display + ch).display;
      steps.push(display.replace(/\D/g, ""));
    }
    assert.deepEqual(steps, [
      "3",
      "32",
      "321",
      "3217",
      "32175",
      "321758",
      "3217580",
      "32175800",
      "321758009",
      "3217580094",
    ]);
    assert.equal(parseUsPhone("(321) 758-0094").digits, "3217580094");
    assert.equal(parseUsPhone("(132) 175-8009").digits, "1321758009");
    assert.equal(toUsE164("(132) 175-8009"), null);
  });

  it("does not apply (XXX) XXX-XXXX until the number is complete", () => {
    assert.equal(parseUsPhone("321").display, "321");
    assert.equal(parseUsPhone("3217580").display, "3217580");
    assert.equal(parseUsPhone("321758009").display, "321758009");
    assert.equal(parseUsPhone("3217580094").display, "(321) 758-0094");
  });

  it("rejects letters, too few digits, and too many digits", () => {
    assert.equal(parseUsPhone("321ABC7580").reason, "letters");
    assert.equal(parseUsPhone("321ABC7580").valid, false);
    assert.equal(parseUsPhone("321758009").reason, "too_short");
    assert.equal(parseUsPhone("32175800941").reason, "too_long");
    assert.equal(parseUsPhone("132175800941").reason, "too_long");
    assert.equal(parseUsPhone("32175800941").digits, "32175800941");
    assert.equal(toUsE164("32175800941"), null);
    assert.equal(toUsE164("abc"), null);
  });
});

describe("caret helpers", () => {
  it("maps caret through formatting characters without dropping digits", () => {
    const formatted = "(321) 758-0094";
    assert.equal(countDigitsBefore(formatted, 0), 0);
    assert.equal(countDigitsBefore(formatted, 4), 3); // after 1
    assert.equal(countDigitsBefore(formatted, formatted.length), 10);
    assert.equal(caretFromDigitIndex(formatted, 3), 4);
    assert.equal(caretFromDigitIndex(formatted, 10), formatted.length);
  });
});
