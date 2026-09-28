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
      <label className="block rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5">
        <span className="block text-sm font-semibold text-slate-700">
          Product images
        </span>
        <span className="mt-1 block text-xs text-slate-500">
          Up to 5 JPG, PNG, or WebP files · 5 MB each
        </span>
        <input
          name="images"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="mt-4 block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:font-semibold file:text-white"
        />
      </label>
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
