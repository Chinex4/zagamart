"use client";

import { useActionState } from "react";

import { forgotPasswordAction } from "@/features/auth/actions/auth.actions";
import { AuthMessage } from "@/features/auth/components/auth-message";

const initialState = {};

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(
    forgotPasswordAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-5">
      <AuthMessage error={state.error} success={state.success} />
      <label className="block">
        <span className="mb-2 block text-sm font-medium">Email address</span>
        <input
          className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </label>
      <button
        className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending ? "Sending..." : "Send reset instructions"}
      </button>
    </form>
  );
}
