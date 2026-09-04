"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AddressAutocomplete } from "@/components/address-autocomplete";
import {
  ACKS,
  CHANGE_OPTIONS,
  PACKING_READY,
  SERVICES,
  SPECIALTY_ITEMS,
  STOP_KIND,
  YES_NO,
  emptyPayload,
  needsReviewReasons,
  validateStep,
  type MoveChecklistPayload,
} from "@/lib/move-checklist/model";
import { AccessFields } from "./access-fields";
import { PhotoPicker } from "./photos";
import { ChoiceGrid, Field, MultiCards, TextArea, TextInput } from "./ui";
import {
  trackChecklistStarted,
  trackChecklistStep,
  trackChecklistSubmitted,
  trackChecklistValidationError,
  trackChecklistViewed,
} from "@/lib/track";

const STORAGE = "toro-move-checklist-v1";
const START = typeof performance !== "undefined" ? performance.now() : Date.now();

function loadDraft(): MoveChecklistPayload {
  if (typeof window === "undefined") return emptyPayload();
  try {
    const raw = sessionStorage.getItem(STORAGE);
    if (!raw) return emptyPayload();
    return { ...emptyPayload(), ...JSON.parse(raw) };
  } catch {
    return emptyPayload();
  }
}

function saveDraft(p: MoveChecklistPayload) {
  try {
    sessionStorage.setItem(STORAGE, JSON.stringify({ ...p, hp: "" }));
  } catch {
    /* quota */
  }
}

export function MoveChecklistWizard() {
  const [screen, setScreen] = useState<"intro" | "form" | "done">("intro");
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [data, setData] = useState<MoveChecklistPayload>(emptyPayload);
  const [err, setErr] = useState("");
  const [sending, setSending] = useState(false);
  const [reviewId, setReviewId] = useState("");
  const errRef = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    document.documentElement.dataset.jsf = "1";
    trackChecklistViewed();
    setData(loadDraft());
    return () => {
      delete document.documentElement.dataset.jsf;
    };
  }, []);

  useEffect(() => {
    if (screen === "form") saveDraft(data);
  }, [data, screen]);

  useEffect(() => {
    if (err && errRef.current) {
      errRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [err]);

  function patch(partial: Partial<MoveChecklistPayload>) {
    setData((d) => ({ ...d, ...partial }));
  }

  function start() {
    setScreen("form");
    setStep(1);
    if (!started.current) {
      started.current = true;
      trackChecklistStarted();
    }
  }

  function next() {
    const msg = validateStep(step, data);
    if (msg) {
      setErr(msg);
      trackChecklistValidationError(step, msg);
      return;
    }
    setErr("");
    trackChecklistStep(step);
    if (step < 4) setStep((s) => (s + 1) as 1 | 2 | 3 | 4);
  }

  function back() {
    setErr("");
    if (step === 1) {
      setScreen("intro");
      return;
    }
    setStep((s) => (s - 1) as 1 | 2 | 3 | 4);
  }

  async function submit() {
    const msg = validateStep(4, data);
    if (msg) {
      setErr(msg);
      trackChecklistValidationError(4, msg);
      return;
    }
    setErr("");
    setSending(true);
    try {
      const res = await fetch("/api/move-checklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          elapsedMs: Math.round(
            (typeof performance !== "undefined" ? performance.now() : Date.now()) - START,
          ),
        }),
      });
      const json = (await res.json().catch(() => null)) as
        | { ok?: boolean; id?: string; error?: string }
        | null;
      if (!res.ok || !json?.ok) {
        setErr(json?.error || "Could not submit. Please try again.");
        return;
      }
      trackChecklistSubmitted(json.id);
      try {
        sessionStorage.removeItem(STORAGE);
      } catch {
        /* */
      }
      setReviewId(json.id || "");
      setScreen("done");
    } catch {
      setErr("Network error. Check your connection and try again.");
    } finally {
      setSending(false);
    }
  }

  if (screen === "intro") {
    return (
      <div className="mdc-wrap">
        <p className="mdc-kicker">After your deposit</p>
        <h1 className="mdc-title">Help Us Finalize Your Move</h1>
        <p className="mdc-lede">
          Your deposit has been received. Please complete this quick checklist so Toro
          Movers can confirm your move details, prepare the right crew and equipment, and
          send your final booking confirmation.
        </p>
        <ul className="mdc-benefits">
          <li>Takes about 3 minutes</li>
          <li>Helps us prepare for parking, access, inventory, and special handling</li>
          <li>You may upload photos of stairs, parking, elevators, or specialty items</li>
        </ul>
        <button type="button" className="mdc-btn mdc-btn-primary" onClick={start}>
          Start Move Checklist
        </button>
      </div>
    );
  }

  if (screen === "done") {
    return (
      <div className="mdc-wrap">
        <p className="mdc-kicker">Submitted</p>
        <h1 className="mdc-title">Checklist Received — You’re Almost Confirmed</h1>
        <p className="mdc-lede">
          Toro Movers has received your move details. Our team will review the information
          and send your final booking confirmation shortly.
        </p>
        <p className="mdc-lede">
          If you need to update anything before we confirm, call or text{" "}
          <a href="tel:+16896002720">(689) 600-2720</a> or email{" "}
          <a href="mailto:hello@toromovers.com">hello@toromovers.com</a>.
        </p>
        {reviewId ? <p className="mdc-hint">Reference: {reviewId.slice(0, 8)}</p> : null}
        <Link href="/" className="mdc-btn mdc-btn-primary">
          Return to Homepage
        </Link>
      </div>
    );
  }

  const titles = [
    "Move details",
    "Pickup access",
    "Delivery Location Access",
    "Inventory, services & review",
  ];

  return (
    <div className="mdc-wrap">
      <div className="mdc-progress" aria-hidden>
        <span style={{ width: `${(step / 4) * 100}%` }} />
      </div>
      <p className="mdc-step">
        Step {step} of 4 · {titles[step - 1]}
      </p>

      {err ? (
        <div ref={errRef} className="mdc-banner" role="alert">
          {err}
        </div>
      ) : null}

      {step === 1 ? (
        <StepDetails data={data} patch={patch} />
      ) : null}
      {step === 2 ? (
        <AccessFields
          location="pickup"
          value={data.pickup}
          onChange={(pickup) => patch({ pickup })}
        />
      ) : null}
      {step === 3 ? (
        <AccessFields
          location="delivery"
          value={data.delivery}
          onChange={(delivery) => patch({ delivery })}
        />
      ) : null}
      {step === 4 ? (
        <StepFour data={data} patch={patch} onEdit={setStep} />
      ) : null}

      <div className="mdc-nav">
        <button type="button" className="mdc-btn mdc-btn-ghost" onClick={back}>
          Back
        </button>
        {step < 4 ? (
          <button type="button" className="mdc-btn mdc-btn-primary" onClick={next}>
            Continue
          </button>
        ) : (
          <button
            type="button"
            className="mdc-btn mdc-btn-primary"
            disabled={sending}
            onClick={() => void submit()}
          >
            {sending ? "Sending…" : "Submit Move Checklist"}
          </button>
        )}
      </div>
      <input
        className="mdc-hp"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        value={data.hp}
        onChange={(e) => patch({ hp: e.target.value })}
      />
    </div>
  );
}

function StepDetails({
  data,
  patch,
}: {
  data: MoveChecklistPayload;
  patch: (p: Partial<MoveChecklistPayload>) => void;
}) {
  return (
    <>
      <Field label="Full name">
        <TextInput
          value={data.fullName}
          onChange={(v) => patch({ fullName: v })}
          autoComplete="name"
          name="name"
        />
      </Field>
      <Field label="Email address">
        <TextInput
          type="email"
          value={data.email}
          onChange={(v) => patch({ email: v })}
          autoComplete="email"
          inputMode="email"
          name="email"
        />
      </Field>
      <Field label="Best mobile phone number">
        <TextInput
          type="tel"
          value={data.phone}
          onChange={(v) => patch({ phone: v })}
          autoComplete="tel"
          inputMode="tel"
          name="phone"
        />
      </Field>
      <Field label="Scheduled move date">
        <TextInput
          type="date"
          value={data.moveDate}
          onChange={(v) => patch({ moveDate: v })}
          name="moveDate"
        />
      </Field>
      <Field label="Pickup address">
        <AddressAutocomplete
          value={data.pickupAddress}
          onChange={(v) => patch({ pickupAddress: v })}
          placeholder="Street, city, ZIP"
          ariaLabel="Pickup address"
        />
      </Field>
      <Field label="Pickup apartment/unit (optional)">
        <TextInput
          value={data.pickupUnit}
          onChange={(v) => patch({ pickupUnit: v })}
          autoComplete="address-line2"
        />
      </Field>
      <Field label="Delivery address">
        <AddressAutocomplete
          value={data.deliveryAddress}
          onChange={(v) => patch({ deliveryAddress: v })}
          placeholder="Street, city, ZIP"
          ariaLabel="Delivery address"
        />
      </Field>
      <Field label="Delivery apartment/unit (optional)">
        <TextInput
          value={data.deliveryUnit}
          onChange={(v) => patch({ deliveryUnit: v })}
          autoComplete="address-line2"
        />
      </Field>
      <Field label="Will you be present at pickup?">
        <ChoiceGrid
          options={YES_NO}
          value={data.presentPickup}
          onChange={(v) => patch({ presentPickup: v })}
        />
      </Field>
      {data.presentPickup === "No" ? (
        <>
          <Field label="Pickup contact full name">
            <TextInput
              value={data.pickupContactName}
              onChange={(v) => patch({ pickupContactName: v })}
            />
          </Field>
          <Field label="Pickup contact phone">
            <TextInput
              type="tel"
              inputMode="tel"
              value={data.pickupContactPhone}
              onChange={(v) => patch({ pickupContactPhone: v })}
            />
          </Field>
        </>
      ) : null}
      <Field label="Will you be present at delivery?">
        <ChoiceGrid
          options={YES_NO}
          value={data.presentDelivery}
          onChange={(v) => patch({ presentDelivery: v })}
        />
      </Field>
      {data.presentDelivery === "No" ? (
        <>
          <Field label="Delivery contact full name">
            <TextInput
              value={data.deliveryContactName}
              onChange={(v) => patch({ deliveryContactName: v })}
            />
          </Field>
          <Field label="Delivery contact phone">
            <TextInput
              type="tel"
              inputMode="tel"
              value={data.deliveryContactPhone}
              onChange={(v) => patch({ deliveryContactPhone: v })}
            />
          </Field>
        </>
      ) : null}
      <Field label="Is there an additional stop?">
        <ChoiceGrid
          options={YES_NO}
          value={data.additionalStop}
          onChange={(v) => patch({ additionalStop: v })}
        />
      </Field>
      {data.additionalStop === "Yes" ? (
        <>
          <Field label="Additional-stop address">
            <AddressAutocomplete
              value={data.extraStopAddress}
              onChange={(v) => patch({ extraStopAddress: v })}
              placeholder="Street, city, ZIP"
              ariaLabel="Additional stop address"
            />
          </Field>
          <Field label="Are items being picked up or dropped off?">
            <ChoiceGrid
              options={STOP_KIND}
              value={data.extraStopKind}
              onChange={(v) => patch({ extraStopKind: v })}
            />
          </Field>
          <Field label="Access instructions">
            <TextArea
              value={data.extraStopAccess}
              onChange={(v) => patch({ extraStopAccess: v })}
            />
          </Field>
          <PhotoPicker
            label="Optional photo"
            files={data.extraStopPhotos}
            max={3}
            onChange={(extraStopPhotos) => patch({ extraStopPhotos })}
          />
        </>
      ) : null}
    </>
  );
}

function StepFour({
  data,
  patch,
  onEdit,
}: {
  data: MoveChecklistPayload;
  patch: (p: Partial<MoveChecklistPayload>) => void;
  onEdit: (s: 1 | 2 | 3 | 4) => void;
}) {
  const flags = needsReviewReasons(data);
  function toggleChange(v: string) {
    if (v === "No changes") {
      patch({ changes: ["No changes"] });
      return;
    }
    const next = data.changes.filter((c) => c !== "No changes");
    patch({
      changes: next.includes(v) ? next.filter((c) => c !== v) : [...next, v],
    });
  }
  function toggleSpec(v: string) {
    patch({
      specialtyItems: data.specialtyItems.includes(v)
        ? data.specialtyItems.filter((x) => x !== v)
        : [...data.specialtyItems, v],
    });
  }
  function toggleSvc(v: string) {
    patch({
      services: data.services.includes(v)
        ? data.services.filter((x) => x !== v)
        : [...data.services, v],
    });
  }

  return (
    <>
      <Field label="Has anything changed since your original quote?">
        <MultiCards options={CHANGE_OPTIONS} values={data.changes} onToggle={toggleChange} />
      </Field>
      {data.changes.some((c) => c && c !== "No changes") ? (
        <>
          <Field label="Please describe the change">
            <TextArea value={data.changeNotes} onChange={(v) => patch({ changeNotes: v })} />
          </Field>
          <PhotoPicker
            label="Photos of the change (optional)"
            files={data.changePhotos}
            max={3}
            onChange={(changePhotos) => patch({ changePhotos })}
          />
        </>
      ) : null}

      <p className="mdc-subhead">Specialty items</p>
      <MultiCards
        options={SPECIALTY_ITEMS}
        values={data.specialtyItems}
        onToggle={toggleSpec}
      />
      {data.specialtyItems.length ? (
        <>
          <Field label="Item description">
            <TextArea
              value={data.specialtyDescription}
              onChange={(v) => patch({ specialtyDescription: v })}
            />
          </Field>
          <PhotoPicker
            label="Upload 1–3 photos"
            files={data.specialtyPhotos}
            max={3}
            onChange={(specialtyPhotos) => patch({ specialtyPhotos })}
          />
          <Field label="Are there stairs, narrow doors, tight turns, or other access concerns for this item?">
            <ChoiceGrid
              options={YES_NO}
              value={data.specialtyAccessConcern}
              onChange={(v) => patch({ specialtyAccessConcern: v })}
            />
          </Field>
          {data.specialtyAccessConcern === "Yes" ? (
            <Field label="Access details">
              <TextArea
                value={data.specialtyAccessNotes}
                onChange={(v) => patch({ specialtyAccessNotes: v })}
              />
            </Field>
          ) : null}
        </>
      ) : null}

      <Field label="Will all boxes be packed, sealed, and labeled before the crew arrives?">
        <ChoiceGrid
          options={PACKING_READY}
          value={data.packingReady}
          onChange={(v) => patch({ packingReady: v })}
          columns={1}
          wide
        />
      </Field>
      <Field label="Which services do you need? Select all that apply.">
        <MultiCards options={SERVICES} values={data.services} onToggle={toggleSvc} />
      </Field>

      <div className="mdc-review">
        <h2>Review before you submit</h2>
        <ReviewBlock title="Move details" onEdit={() => onEdit(1)}>
          <p>{data.fullName}</p>
          <p>{data.email} · {data.phone}</p>
          <p>Move date: {data.moveDate}</p>
          <p>Pickup: {data.pickupAddress}{data.pickupUnit ? ` · ${data.pickupUnit}` : ""}</p>
          <p>Delivery: {data.deliveryAddress}{data.deliveryUnit ? ` · ${data.deliveryUnit}` : ""}</p>
          <p>Present at pickup: {data.presentPickup || "—"}</p>
          <p>Present at delivery: {data.presentDelivery || "—"}</p>
          <p>Additional stop: {data.additionalStop || "—"}</p>
        </ReviewBlock>
        <ReviewBlock title="Pickup access" onEdit={() => onEdit(2)}>
          <AccessSummary site={data.pickup} />
        </ReviewBlock>
        <ReviewBlock title="Delivery access" onEdit={() => onEdit(3)}>
          <AccessSummary site={data.delivery} />
        </ReviewBlock>
        <ReviewBlock title="Inventory & services" onEdit={() => onEdit(4)}>
          <p>Changes: {data.changes.join(", ") || "—"}</p>
          <p>Specialty: {data.specialtyItems.join(", ") || "None"}</p>
          <p>Packing: {data.packingReady || "—"}</p>
          <p>Services: {data.services.join(", ") || "None"}</p>
        </ReviewBlock>
        {flags.length ? (
          <p className="mdc-flag">
            Our team will review: {flags.join(" · ")}
          </p>
        ) : null}
      </div>

      <p className="mdc-subhead">Please confirm each item</p>
      {ACKS.map((a) => (
        <label key={a.id} className="mdc-ack">
          <input
            type="checkbox"
            checked={!!data.acks[a.id]}
            onChange={(e) =>
              patch({ acks: { ...data.acks, [a.id]: e.target.checked } })
            }
          />
          <span>{a.label}</span>
        </label>
      ))}
      <Field label="Typed full name as acknowledgment">
        <TextInput
          value={data.typedName}
          onChange={(v) => patch({ typedName: v })}
          autoComplete="name"
        />
      </Field>
      <p className="mdc-hint">
        Completion time is recorded automatically when you submit.
      </p>
    </>
  );
}

function ReviewBlock({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="mdc-review-block">
      <header>
        <h3>{title}</h3>
        <button type="button" className="mdc-link" onClick={onEdit}>
          Edit
        </button>
      </header>
      <div className="mdc-review-body">{children}</div>
    </section>
  );
}

function AccessSummary({ site }: { site: MoveChecklistPayload["pickup"] }) {
  return (
    <>
      <p>
        {site.propertyType || "—"} · {site.floor || "—"}
      </p>
      <p>Stairs: {site.stairs || "—"}{site.stairFlights ? ` · ${site.stairFlights}` : ""}</p>
      <p>
        Elevator: {site.elevator || "—"}
        {site.elevator === "Yes"
          ? ` · reserved ${site.elevatorReserved || "—"} · freight ${site.freightElevator || "—"}`
          : ""}
      </p>
      <p>
        Parking: {site.parking || "—"} · Carry: {site.carry || "—"}
      </p>
      <p>Restrictions: {site.restrictions || "—"}</p>
      <p>COI: {site.coi || "—"}</p>
    </>
  );
}
