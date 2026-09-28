"use client";
import { useActionState } from "react";
import { LockKeyhole } from "lucide-react";
import {
  adminLoginAction,
  type AuthActionState,
} from "@/features/auth/actions/auth.actions";
import { AuthMessage } from "./auth-message";
import { PasswordField } from "./password-field";
export function AdminLoginForm() {
  const [state, action, pending] = useActionState(
    adminLoginAction,
    {} as AuthActionState,
  );
  return (
    <form action={action} className="space-y-5">
      <AuthMessage error={state.error} />
      <label className="block">
        <span className="mb-2 block text-sm font-medium">
          Administrator email
        </span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
        />
      </label>
      <PasswordField
        name="password"
        label="Password"
        autoComplete="current-password"
      />
      <button
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
      >
        <LockKeyhole className="size-4" />
        {pending ? "Authorizing…" : "Access operations console"}
      </button>
      <p className="text-center text-xs leading-5 text-slate-500">
        Access is restricted to active ZagaMart administrators. Attempts are
        subject to audit.
      </p>
    </form>
  );
}
