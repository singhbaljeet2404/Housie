"use client";

import { useActionState } from "react";
import { login, type FormState } from "../actions";

export function LoginForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(login, { status: "idle" });
  return (
    <form action={action} className="space-y-3">
      <label htmlFor="password" className="block text-sm font-medium text-slate-800">Password</label>
      <input id="password" name="password" type="password" autoComplete="current-password" required autoFocus className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
      {state.message && <p role="alert" className="text-sm text-red-600">{state.message}</p>}
      <button type="submit" disabled={pending} className="w-full rounded-lg bg-brand-600 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
