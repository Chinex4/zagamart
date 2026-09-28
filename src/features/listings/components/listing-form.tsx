"use client";

import { useActionState } from "react";

import {
  createListingAction,
  type ListingActionState,
} from "@/features/listings/actions/listing.actions";
import {
  LISTING_CATEGORIES,
  LISTING_CONDITIONS,
} from "@/features/listings/schemas/listing.schema";

const initialState: ListingActionState = {};

export function ListingForm() {
  const [state, action, pending] = useActionState(
    createListingAction,
    initialState,
  );

  return (
    <form action={action} className="space-y-5">
      <Field label="Title" name="title" placeholder="What are you selling?" />
      <div className="grid gap-5 sm:grid-cols-2">
        <SelectField
          label="Category"
          name="category"
          options={LISTING_CATEGORIES}
        />
        <SelectField
          label="Condition"
          name="condition"
          options={LISTING_CONDITIONS}
        />
      </div>
      <Field label="Price (₦)" name="priceNaira" type="number" min="1" />
      <Field
        label="Meet-up location"
        name="locationLabel"
        placeholder="e.g. Site II gate"
      />
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-700">
          Description
        </span>
        <textarea
          required
          minLength={10}
          maxLength={5000}
          name="description"
          rows={7}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
        />
      </label>
      {state.error ? (
        <p className="text-sm text-red-700">{state.error}</p>
      ) : null}
      <button
        disabled={pending}
        className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Publishing…" : "Publish listing"}
      </button>
    </form>
  );
}

function Field(
  props: React.InputHTMLAttributes<HTMLInputElement> & { label: string },
) {
  const { label, ...inputProps } = props;
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </span>
      <input
        required={inputProps.name !== "locationLabel"}
        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
        {...inputProps}
      />
    </label>
  );
}

function SelectField({
  label,
  name,
  options,
}: {
  label: string;
  name: string;
  options: readonly string[];
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </span>
      <select
        required
        name={name}
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-600"
      >
        <option value="">Select</option>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}
