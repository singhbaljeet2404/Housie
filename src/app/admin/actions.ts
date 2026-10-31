"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { checkPassword, clearSessionCookie, requireAdmin, setSessionCookie } from "@/lib/admin-auth";
import { SETTINGS_TAG, getSettingsFresh, saveSettings } from "@/lib/settings";
import { settingsSchema } from "@/lib/settings/schema";
import { deleteKey, setBinary } from "@/lib/storage";
import { deleteLead } from "@/lib/lead-store";
import { SECTIONS, parseField, setPath } from "./fields";

export interface FormState {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
  values?: Record<string, string>; // echoed back on error so React's form reset keeps the edits
}

// --- auth -------------------------------------------------------------------

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const password = String(formData.get("password") ?? "");
  if (!checkPassword(password)) {
    await new Promise((r) => setTimeout(r, 800)); // slow down guessing
    return { status: "error", message: "Incorrect password." };
  }
  await setSessionCookie();
  redirect("/admin");
}

export async function logout() {
  await clearSessionCookie();
  redirect("/admin/login");
}

// --- settings ---------------------------------------------------------------

export async function saveSection(sectionId: string, _prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const section = SECTIONS.find((s) => s.id === sectionId);
  if (!section) return { status: "error", message: "Unknown section." };

  let next = await getSettingsFresh();
  for (const field of section.fields) {
    const raw = formData.get(field.path);
    if (typeof raw === "string") next = setPath(next, field.path, parseField(field.kind, raw));
  }

  const parsed = settingsSchema.safeParse(next);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      // Errors inside lists point at an item ("agent.bio.2"); show them on the list field.
      const path = issue.path.filter((p) => typeof p === "string").join(".");
      fieldErrors[path] ??= issue.message;
    }
    const values = Object.fromEntries(section.fields.map((f) => [f.path, String(formData.get(f.path) ?? "")]));
    return { status: "error", message: "Please fix the highlighted fields.", fieldErrors, values };
  }

  await saveSettings(parsed.data);
  updateTag(SETTINGS_TAG);
  return { status: "success", message: "Saved. The live site now shows your changes." };
}

const MAX_PHOTO_BYTES = 2 * 1024 * 1024;
const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function uploadPhoto(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) return { status: "error", message: "Choose an image first." };
  if (!PHOTO_TYPES.includes(file.type)) return { status: "error", message: "Use a JPG, PNG or WebP image." };
  if (file.size > MAX_PHOTO_BYTES) return { status: "error", message: "Image must be under 2 MB." };

  const settings = await getSettingsFresh();
  const key = `agent-photo-${Date.now()}`;
  await setBinary("media", key, await file.arrayBuffer(), file.type);
  await saveSettings(setPath(settings, "agent.photo", key));
  if (settings.agent.photo) await deleteKey("media", settings.agent.photo).catch(() => {});
  updateTag(SETTINGS_TAG);
  return { status: "success", message: "Photo updated." };
}

export async function removePhoto() {
  await requireAdmin();
  const settings = await getSettingsFresh();
  if (!settings.agent.photo) return;
  await saveSettings(setPath(settings, "agent.photo", undefined));
  await deleteKey("media", settings.agent.photo).catch(() => {});
  updateTag(SETTINGS_TAG);
}

// --- leads ------------------------------------------------------------------

export async function removeLead(id: string) {
  await requireAdmin();
  await deleteLead(id);
  redirect("/admin/leads");
}
