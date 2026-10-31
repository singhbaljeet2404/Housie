"use client";

import { useActionState } from "react";
import { saveSection, type FormState } from "./actions";
import type { SectionDef } from "./fields";

const input =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100";

export function SectionForm({ section, values }: { section: SectionDef; values: Record<string, string> }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveSection.bind(null, section.id), { status: "idle" });

  return (
    <form action={action} className="space-y-4">
      {section.fields.map((field) => {
        const id = `f-${field.path}`;
        const error = state.fieldErrors && Object.entries(state.fieldErrors).find(([p]) => p === field.path || p.startsWith(`${field.path}.`))?.[1];
        const common = { id, name: field.path, defaultValue: state.values?.[field.path] ?? values[field.path], "aria-invalid": Boolean(error) };
        return (
          <div key={field.path}>
            <label htmlFor={id} className="mb-1 block text-sm font-medium text-slate-800">{field.label}</label>
            {field.kind === "color" ? (
              <div className="flex items-center gap-3">
                <input {...common} type="color" className="h-10 w-16 cursor-pointer rounded border border-slate-300" />
                <span className="text-xs text-slate-500">Click the swatch to pick a colour.</span>
              </div>
            ) : field.kind === "textarea" || field.kind === "lines" ? (
              <textarea {...common} rows={field.kind === "lines" ? 4 : 3} className={input} />
            ) : field.kind === "paragraphs" ? (
              <textarea {...common} rows={8} className={input} />
            ) : field.kind === "longtext" ? (
              <textarea {...common} rows={16} className={`${input} font-mono text-xs leading-relaxed`} />
            ) : (
              <input {...common} type={field.kind} className={input} />
            )}
            {field.help && <p className="mt-1 text-xs text-slate-500">{field.help}</p>}
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
          </div>
        );
      })}
      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className="rounded-lg bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
          {pending ? "Saving…" : "Save"}
        </button>
        {state.message && (
          <p role="status" className={`text-sm ${state.status === "error" ? "text-red-600" : "text-emerald-700"}`}>{state.message}</p>
        )}
      </div>
    </form>
  );
}
