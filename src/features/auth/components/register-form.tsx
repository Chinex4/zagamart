"use client";

import Link from "next/link";
import { useActionState } from "react";

import {
  registerAction,
  type AuthActionState,
} from "@/features/auth/actions/auth.actions";
import { AuthMessage } from "@/features/auth/components/auth-message";

const initialState: AuthActionState = {};

const inputClassName =
  "w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100";

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(
    registerAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-5">
      <AuthMessage error={state.error} success={state.success} />
      <label className="block">
        <span className="mb-2 block text-sm font-medium">Full name</span>
        <input
          className={inputClassName}
          name="fullName"
          autoComplete="name"
          required
        />
      </label>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-medium">Matric number</span>
          <input className={inputClassName} name="matricNumber" required />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium">Level</span>
          <input
            className={inputClassName}
            name="level"
            placeholder="e.g. 400"
            required
          />
        </label>
      </div>
      <label className="block">
        <span className="mb-2 block text-sm font-medium">Student email</span>
        <input
          className={inputClassName}
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm font-medium">Programme</span>
        <input className={inputClassName} name="programme" required />
      </label>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-medium">Password</span>
          <input
            className={inputClassName}
            name="password"
            type="password"
            autoComplete="new-password"
            required
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium">
            Confirm password
          </span>
          <input
            className={inputClassName}
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
          />
        </label>
      </div>
      <button
        className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending ? "Creating account..." : "Create account"}
      </button>
      <p className="text-center text-sm text-slate-600">
        Already registered?{" "}
        <Link
          className="font-medium text-blue-700 hover:underline"
          href="/login"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
