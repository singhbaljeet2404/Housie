import { cacheLife, cacheTag } from "next/cache";
import { getJSON, setJSON } from "../storage";
import { DEFAULT_SETTINGS, settingsSchema, withDefaults, type SiteSettings } from "./schema";

export const SETTINGS_TAG = "site-settings";
const KEY = "site";

// Cached across requests; the admin save action calls updateTag(SETTINGS_TAG).
export async function getSettings(): Promise<SiteSettings> {
  "use cache";
  cacheTag(SETTINGS_TAG);
  cacheLife("max");
  try {
    return withDefaults(await getJSON("settings", KEY));
  } catch (err) {
    console.error("[settings] falling back to defaults:", err);
    return DEFAULT_SETTINGS;
  }
}

// Uncached read for the admin editor, so it always shows what's stored.
export async function getSettingsFresh(): Promise<SiteSettings> {
  return withDefaults(await getJSON("settings", KEY));
}

export async function saveSettings(next: SiteSettings) {
  await setJSON("settings", KEY, settingsSchema.parse(next));
}

// Fills {agent}, {title}, {brokerage}, {email}, {phone} placeholders in editable text.
export function fillPlaceholders(text: string, s: SiteSettings) {
  return text
    .replaceAll("{agent}", s.agent.name)
    .replaceAll("{title}", s.agent.title)
    .replaceAll("{brokerage}", s.brokerage.name)
    .replaceAll("{email}", s.agent.email)
    .replaceAll("{phone}", s.agent.phone);
}

export type { SiteSettings } from "./schema";
