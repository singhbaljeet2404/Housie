"use client";

import { useActionState } from "react";
import { removePhoto, uploadPhoto, type FormState } from "./actions";

export function PhotoForm({ photo, name }: { photo?: string; name: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(uploadPhoto, { status: "idle" });
  return (
    <div className="flex flex-wrap items-center gap-5">
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={`/media/${photo}`} alt={name} className="h-24 w-24 rounded-full object-cover shadow" />
      ) : (
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-200 text-xs text-slate-500">No photo</div>
      )}
      <form action={action} className="space-y-2">
        <input name="photo" type="file" accept="image/jpeg,image/png,image/webp" required className="block text-sm" />
        <div className="flex items-center gap-3">
          <button type="submit" disabled={pending} className="rounded-lg bg-brand-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
            {pending ? "Uploading…" : "Upload photo"}
          </button>
          {photo && (
            <button type="submit" formAction={removePhoto} formNoValidate className="text-sm text-red-600 hover:underline">Remove</button>
          )}
        </div>
        <p className="text-xs text-slate-500">Square JPG, PNG or WebP, under 2 MB.</p>
        {state.message && <p role="status" className={`text-sm ${state.status === "error" ? "text-red-600" : "text-emerald-700"}`}>{state.message}</p>}
      </form>
    </div>
  );
}
