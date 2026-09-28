"use client";

import { useActionState } from "react";

import {
  submitKycAction,
  type KycActionState,
} from "@/features/kyc/actions/kyc.actions";

const initialState: KycActionState = {};

export function KycForm() {
  const [state, formAction, pending] = useActionState(
    submitKycAction,
    initialState,
  );

  return (
    <form action={formAction} className="mt-8 space-y-6">
      {state.error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          {state.success}
        </p>
      ) : null}

      <DocumentField
        name="studentId"
        title="Student ID card"
        description="Upload a clear photo, scan, or PDF of your current student ID."
      />
      <DocumentField
        name="feeReceipt"
        title="Current fee receipt"
        description="Upload your current school fee receipt or fee breakdown."
      />

      <button
        className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending ? "Submitting..." : "Submit for verification"}
      </button>
    </form>
  );
}

function DocumentField({
  name,
  title,
  description,
}: {
  name: string;
  title: string;
  description: string;
}) {
  return (
    <label className="block rounded-2xl border border-slate-200 p-5">
      <span className="block font-semibold">{title}</span>
      <span className="mt-1 block text-sm leading-6 text-slate-500">
        {description}
      </span>
      <input
        className="mt-4 block w-full text-sm"
        name={name}
        type="file"
        accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
        required
      />
    </label>
  );
}
