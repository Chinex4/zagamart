"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import {
  registerAction,
  type AuthActionState,
} from "@/features/auth/actions/auth.actions";
import { AuthMessage } from "@/features/auth/components/auth-message";
import { PasswordField } from "@/features/auth/components/password-field";

const initialState: AuthActionState = {};
const inputClassName =
  "w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100";

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(
    registerAction,
    initialState,
  );
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const rules = [
    ["At least 8 characters", password.length >= 8],
    ["One uppercase letter", /[A-Z]/.test(password)],
    ["One lowercase letter", /[a-z]/.test(password)],
    ["One number", /[0-9]/.test(password)],
    ["Passwords match", password.length > 0 && password === confirm],
  ] as const;
  const passwordReady = rules.every(([, ok]) => ok);

  return (
    <form action={formAction} className="space-y-5">
      <AuthMessage error={state.error} success={state.success} />
      <label className="block">
        <span className="mb-2 block text-sm font-semibold">Full name</span>
        <input
          className={inputClassName}
          name="fullName"
          autoComplete="name"
          required
        />
      </label>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold">
            Matric number
          </span>
          <input className={inputClassName} name="matricNumber" required />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold">Level</span>
          <input
            className={inputClassName}
            name="level"
            placeholder="e.g. 400"
            required
          />
        </label>
      </div>
      <label className="block">
        <span className="mb-2 block text-sm font-semibold">Student email</span>
        <input
          className={inputClassName}
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm font-semibold">Programme</span>
        <input className={inputClassName} name="programme" required />
      </label>
      <PasswordField
        name="password"
        label="Password"
        autoComplete="new-password"
        value={password}
        onChange={setPassword}
      />
      <PasswordField
        name="confirmPassword"
        label="Confirm password"
        autoComplete="new-password"
        value={confirm}
        onChange={setConfirm}
      />
      <div className="grid gap-2 rounded-2xl bg-slate-50 p-4 sm:grid-cols-2">
        {rules.map(([label, ok]) => (
          <div
            key={label}
            className={`flex items-center gap-2 text-sm ${ok ? "font-medium text-emerald-700" : "text-slate-500"}`}
          >
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full text-xs ${ok ? "bg-emerald-100" : "bg-slate-200"}`}
            >
              {ok ? "✓" : "·"}
            </span>
            {label}
          </div>
        ))}
      </div>
      <button
        className="w-full rounded-xl bg-blue-600 px-4 py-3 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={pending || !passwordReady}
        type="submit"
      >
        {pending ? "Creating account..." : "Create account"}
      </button>
      <p className="text-center text-sm text-slate-600">
        Already registered?{" "}
        <Link
          className="font-semibold text-blue-700 hover:underline"
          href="/login"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
