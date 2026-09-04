"use client";

import {
  CARRY,
  FLOORS,
  PARKING,
  PHOTO_SLOTS,
  PROPERTY_TYPES,
  STAIR_FLIGHTS,
  YES_NO,
  YES_NO_UNSURE,
  type AccessSite,
} from "@/lib/move-checklist/model";
import { ChoiceGrid, Field, TextArea, TextInput } from "./ui";
import { PhotoPicker } from "./photos";

export function AccessFields({
  value,
  onChange,
  location,
}: {
  value: AccessSite;
  onChange: (next: AccessSite) => void;
  location: "pickup" | "delivery";
}) {
  const set = <K extends keyof AccessSite>(key: K, v: AccessSite[K]) =>
    onChange({ ...value, [key]: v });

  return (
    <>
      <Field label={`What type of property is the ${location} location?`}>
        <ChoiceGrid
          options={PROPERTY_TYPES}
          value={value.propertyType}
          onChange={(v) => set("propertyType", v)}
        />
      </Field>
      <Field label={`What floor is the ${location} located on?`}>
        <ChoiceGrid options={FLOORS} value={value.floor} onChange={(v) => set("floor", v)} />
      </Field>
      <Field label={`Are stairs required at ${location}?`}>
        <ChoiceGrid
          options={YES_NO}
          value={value.stairs}
          onChange={(v) => set("stairs", v)}
        />
      </Field>
      {value.stairs === "Yes" ? (
        <Field label="How many flights of stairs?">
          <ChoiceGrid
            options={STAIR_FLIGHTS}
            value={value.stairFlights}
            onChange={(v) => set("stairFlights", v)}
          />
        </Field>
      ) : null}
      <Field label={`Is an elevator required at ${location}?`}>
        <ChoiceGrid
          options={YES_NO}
          value={value.elevator}
          onChange={(v) => set("elevator", v)}
        />
      </Field>
      {value.elevator === "Yes" ? (
        <>
          <Field label="Has the elevator been reserved?">
            <ChoiceGrid
              options={YES_NO_UNSURE}
              value={value.elevatorReserved}
              onChange={(v) => set("elevatorReserved", v)}
            />
          </Field>
          <Field label="Is it a freight elevator?">
            <ChoiceGrid
              options={YES_NO_UNSURE}
              value={value.freightElevator}
              onChange={(v) => set("freightElevator", v)}
            />
          </Field>
        </>
      ) : null}
      <Field label={`What is the truck parking situation at ${location}?`}>
        <ChoiceGrid
          options={PARKING}
          value={value.parking}
          onChange={(v) => set("parking", v)}
          wide
          columns={1}
        />
      </Field>
      <Field label="How far will the crew need to carry items from the truck to the entrance?">
        <ChoiceGrid
          options={CARRY}
          value={value.carry}
          onChange={(v) => set("carry", v)}
          columns={1}
          wide
        />
      </Field>
      <Field label="Are there parking, gate, HOA, security, building, or access restrictions?">
        <ChoiceGrid
          options={YES_NO}
          value={value.restrictions}
          onChange={(v) => set("restrictions", v)}
        />
      </Field>
      {value.restrictions === "Yes" ? (
        <Field label="Please describe the access instructions or restrictions.">
          <TextArea
            value={value.restrictionNotes}
            onChange={(v) => set("restrictionNotes", v)}
            placeholder="Gate code, loading hours, street-side, etc."
          />
        </Field>
      ) : null}
      <Field label="Does the building require a Certificate of Insurance (COI)?">
        <ChoiceGrid
          options={YES_NO_UNSURE}
          value={value.coi}
          onChange={(v) => set("coi", v)}
        />
      </Field>
      {value.coi === "Yes" || value.coi === "Not sure" ? (
        <>
          <Field label="Building/property manager name">
            <TextInput
              value={value.coiManagerName}
              onChange={(v) => set("coiManagerName", v)}
              autoComplete="name"
            />
          </Field>
          <Field label="Building/property manager email">
            <TextInput
              type="email"
              value={value.coiManagerEmail}
              onChange={(v) => set("coiManagerEmail", v)}
              autoComplete="email"
              inputMode="email"
            />
          </Field>
          <Field label="Building/property manager phone">
            <TextInput
              type="tel"
              value={value.coiManagerPhone}
              onChange={(v) => set("coiManagerPhone", v)}
              autoComplete="tel"
              inputMode="tel"
            />
          </Field>
          <PhotoPicker
            label="Upload COI requirements or a sample (optional)"
            files={value.photos.coi || []}
            max={2}
            onChange={(next) =>
              set("photos", { ...value.photos, coi: next })
            }
          />
        </>
      ) : null}
      <p className="mdc-subhead">Optional photos</p>
      {PHOTO_SLOTS.map((slot) => (
        <PhotoPicker
          key={slot}
          label={slot}
          files={value.photos[slot] || []}
          max={2}
          onChange={(next) => set("photos", { ...value.photos, [slot]: next })}
        />
      ))}
    </>
  );
}
