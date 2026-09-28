"use client";

import { useActionState } from "react";

import {
  resetPasswordAction,
  type AuthActionState,
} from "@/features/auth/actions/auth.actions";
import { AuthMessage } from "@/features/auth/components/auth-message";

const initialState: AuthActionState = {};
const inputClassName =
  "w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100";

export function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState(
    resetPasswordAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-5">
      <AuthMessage error={state.error} success={state.success} />
      <label className="block">
        <span className="mb-2 block text-sm font-medium">New password</span>
        <input
          className={inputClassName}
          name="password"
          type="password"
          autoComplete="new-password"
          required
        />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm font-medium">Confirm password</span>
        <input
          className={inputClassName}
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
        />
      </label>
      <button
        className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending ? "Updating..." : "Update password"}
      </button>
    </form>
  );
}
