"use client";

import Link from "next/link";
import { useActionState } from "react";

import { loginAction } from "@/features/auth/actions/auth.actions";
import { AuthMessage } from "@/features/auth/components/auth-message";

const initialState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <AuthMessage error={state.error} />
      <label className="block">
        <span className="mb-2 block text-sm font-medium">Email address</span>
        <input className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100" name="email" type="email" autoComplete="email" required />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm font-medium">Password</span>
        <input className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100" name="password" type="password" autoComplete="current-password" required />
      </label>
      <div className="flex items-center justify-between gap-4 text-sm">
        <Link className="font-medium text-blue-700 hover:underline" href="/forgot-password">Forgot password?</Link>
        <Link className="text-slate-600 hover:text-slate-950" href="/register">Create account</Link>
      </div>
      <button className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60" disabled={pending} type="submit">
        {pending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
