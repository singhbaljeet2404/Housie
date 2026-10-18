"use client";

import { useActionState, useState } from "react";
import { submitLead, type LeadFormState } from "@/app/actions";
import { site } from "@/config/site";

const initialState: LeadFormState = { status: "idle" };

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100";

export function LeadForm({
  defaultType = "contact",
  allowShowing = false,
  listingId,
  listingAddress,
  defaultMessage,
}: {
  defaultType?: "contact" | "showing" | "listing-question";
  allowShowing?: boolean;
  listingId?: string;
  listingAddress?: string;
  defaultMessage?: string;
}) {
  const [state, formAction, pending] = useActionState(submitLead, initialState);
  const [type, setType] = useState(defaultType);

  if (state.status === "success") {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-800" role="status">
        <p className="font-semibold">Message sent</p>
        <p className="mt-1">{state.message}</p>
      </div>
    );
  }

  const error = (field: string) =>
    state.fieldErrors?.[field] && <p className="mt-1 text-xs text-red-600">{state.fieldErrors[field]}</p>;

  return (
    <form action={formAction} className="space-y-3">
      {allowShowing && (
        <div className="grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1 text-sm font-medium">
          {(["showing", "listing-question"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`rounded-md py-1.5 ${type === t ? "bg-white text-brand-700 shadow-sm" : "text-slate-600"}`}
            >
              {t === "showing" ? "Book a showing" : "Ask a question"}
            </button>
          ))}
        </div>
      )}
      <input type="hidden" name="type" value={type} />
      {listingId && <input type="hidden" name="listingId" value={listingId} />}
      {listingAddress && <input type="hidden" name="listingAddress" value={listingAddress} />}
      <div aria-hidden className="hidden">
        <label>
          Company <input name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-slate-700" htmlFor="lead-name">Name</label>
        <input id="lead-name" name="name" defaultValue={state.values?.name} autoComplete="name" required className={inputClass} />
        {error("name")}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-700" htmlFor="lead-email">Email</label>
          <input id="lead-email" name="email" defaultValue={state.values?.email} type="email" autoComplete="email" required className={inputClass} />
          {error("email")}
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-700" htmlFor="lead-phone">Phone (optional)</label>
          <input id="lead-phone" name="phone" defaultValue={state.values?.phone} type="tel" autoComplete="tel" className={inputClass} />
          {error("phone")}
        </div>
      </div>
      {type === "showing" && (
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-700" htmlFor="lead-time">Preferred day and time</label>
          <input id="lead-time" name="preferredTime" defaultValue={state.values?.preferredTime} placeholder="e.g. Saturday afternoon" className={inputClass} />
        </div>
      )}
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-700" htmlFor="lead-message">Message</label>
        <textarea
          id="lead-message"
          name="message"
          rows={4}
          defaultValue={state.values?.message ?? defaultMessage}
          className={inputClass}
        />
        {error("message")}
      </div>
      <label className="flex items-start gap-2 text-xs text-slate-600">
        <input type="checkbox" name="marketingConsent" className="mt-0.5" />
        <span>
          Yes, {site.agent.name} may also send me listing updates and market news by email. I can unsubscribe at any
          time.
        </span>
      </label>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
      >
        {pending ? "Sending…" : type === "showing" ? "Request showing" : "Send message"}
      </button>
      {state.status === "error" && state.message && (
        <p className="text-sm text-red-600" role="alert">{state.message}</p>
      )}
      <p className="text-[11px] leading-snug text-slate-500">
        Your details go only to {site.agent.name}, {site.agent.title}, {site.brokerage.name}, to respond to your
        enquiry. See our <a href="/privacy" className="underline">privacy policy</a>.
      </p>
    </form>
  );
}
