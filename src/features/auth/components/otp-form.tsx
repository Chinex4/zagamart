"use client";
import { useActionState, useEffect, useState } from "react";
import {
  resendEmailOtpAction,
  resendLoginOtpAction,
  verifyEmailOtpAction,
  verifyLoginOtpAction,
  type AuthActionState,
} from "../actions/auth.actions";
import { AuthMessage } from "./auth-message";
export function OtpForm({ defaultEmail = "", mode = "signup" }: { defaultEmail?: string; mode?: "signup" | "login" }) {
  const [state, action, pending] = useActionState(
    mode === "login" ? verifyLoginOtpAction : verifyEmailOtpAction,
    {} as AuthActionState,
  );
  const [resend, resendAction, resending] = useActionState(
    mode === "login" ? resendLoginOtpAction : resendEmailOtpAction,
    {} as AuthActionState,
  );
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (!seconds) return;
    const timer = setInterval(
      () => setSeconds((value) => Math.max(0, value - 1)),
      1000,
    );
    return () => clearInterval(timer);
  }, [seconds]);
  return (
    <div className="space-y-5">
      <form action={action} className="space-y-5">
        <AuthMessage error={state.error} />
        <label className="block">
          <span className="mb-2 block text-sm font-medium">Email address</span>
          <input
            name="email"
            type="email"
            required
            defaultValue={defaultEmail}
            readOnly={Boolean(defaultEmail)}
            className="w-full rounded-xl border border-slate-300 px-4 py-3"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium">
            6-digit verification code
          </span>
          <input
            name="token"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            required
            autoComplete="one-time-code"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-center text-2xl tracking-[.45em]"
          />
        </label>
        <button
          disabled={pending}
          className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white disabled:opacity-60"
        >
          {pending ? "Verifying…" : "Verify email"}
        </button>
      </form>
      <form
        action={async (data) => {
          resendAction(data);
          setSeconds(60);
        }}
        className="space-y-3"
      >
        <AuthMessage error={resend.error} success={resend.success} />
        <input
          aria-label="Email for resend"
          name="email"
          type="email"
          required
          placeholder="Email used to register"
          defaultValue={defaultEmail}
          readOnly={Boolean(defaultEmail)}
          className="w-full rounded-xl border border-slate-300 px-4 py-3"
        />
        <button
          disabled={resending || seconds > 0}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold disabled:opacity-50"
        >
          {seconds
            ? `Resend available in ${seconds}s`
            : resending
              ? "Sending…"
              : "Resend code"}
        </button>
      </form>
    </div>
  );
}
