"use server";

import { headers } from "next/headers";
import { deliverLead, leadFromFormData } from "@/lib/leads";

export interface LeadFormState {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
  values?: Record<string, string>; // echoed back so React's post-action form reset keeps the input
}

export async function submitLead(_prev: LeadFormState, formData: FormData): Promise<LeadFormState> {
  // Honeypot: real visitors never see or fill this field.
  if (formData.get("company")) return { status: "success", message: "Thanks! I'll be in touch shortly." };

  formData.set("pageUrl", (await headers()).get("referer") ?? "");
  const parsed = leadFromFormData(formData);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      fieldErrors[key] ??= issue.message;
    }
    return { status: "error", message: "Please check the highlighted fields.", fieldErrors, values: echo(formData) };
  }

  try {
    await deliverLead(parsed.data);
  } catch {
    return {
      status: "error",
      message: "Something went wrong sending your message. Please call or email me directly.",
      values: echo(formData),
    };
  }

  return {
    status: "success",
    message:
      parsed.data.type === "showing"
        ? "Thanks! I'll confirm your showing time shortly."
        : "Thanks! I'll get back to you shortly.",
  };
}

function echo(formData: FormData) {
  const values: Record<string, string> = {};
  for (const key of ["name", "email", "phone", "message", "preferredTime"]) {
    const value = formData.get(key);
    if (typeof value === "string") values[key] = value;
  }
  return values;
}
