// Describes the admin settings form. Shared by the server action (to parse and
// validate) and the client form (to render), so adding a setting means adding
// it to the schema and listing it here.

import type { SiteSettings } from "@/lib/settings/schema";

export type FieldKind =
  | "text"
  | "email"
  | "tel"
  | "textarea" // single block of text
  | "longtext" // large editor for page content
  | "lines" // string[] — one item per line
  | "paragraphs" // string[] — paragraphs separated by a blank line
  | "color";

export interface FieldDef {
  path: string; // dot path into SiteSettings, e.g. "agent.name"
  label: string;
  kind: FieldKind;
  help?: string;
}

export interface SectionDef {
  id: string;
  title: string;
  description: string;
  fields: FieldDef[];
}

const PLACEHOLDER_HELP = "You can use {agent}, {title}, {brokerage}, {email} and {phone}; they are filled in automatically.";
const RICH_HELP = `Separate paragraphs with a blank line. Start a line with "## " for a heading, or "- " for bullet points. ${PLACEHOLDER_HELP}`;

export const SECTIONS: SectionDef[] = [
  {
    id: "profile",
    title: "Your profile",
    description: "Shown in the header, footer, About page and on every lead form.",
    fields: [
      { path: "agent.name", label: "Name (as registered with RECO)", kind: "text" },
      { path: "agent.title", label: "Registered title", kind: "text", help: "e.g. Sales Representative or Broker" },
      { path: "agent.phone", label: "Direct phone", kind: "tel" },
      { path: "agent.email", label: "Public email", kind: "email" },
      { path: "agent.languages", label: "Languages", kind: "lines", help: "One per line." },
      { path: "agent.bio", label: "Bio", kind: "paragraphs", help: "Separate paragraphs with a blank line." },
    ],
  },
  {
    id: "brokerage",
    title: "Brokerage",
    description: "RECO requires the brokerage name to appear clearly on every page.",
    fields: [
      { path: "brokerage.name", label: "Brokerage name", kind: "text" },
      { path: "brokerage.address", label: "Office address", kind: "text" },
      { path: "brokerage.phone", label: "Office phone", kind: "tel" },
    ],
  },
  {
    id: "home",
    title: "Home page",
    description: "Headline, intro and the section about you.",
    fields: [
      { path: "home.heroTitle", label: "Headline", kind: "text" },
      { path: "home.heroSubtitle", label: "Sub-headline", kind: "textarea" },
      { path: "home.justListedTitle", label: "Latest listings heading", kind: "text" },
      { path: "home.agentSectionLabel", label: "Label above your name", kind: "text" },
      { path: "home.highlights", label: "Why work with me (checklist)", kind: "lines", help: "One point per line." },
      { path: "home.contactCardTitle", label: "Contact form heading", kind: "text" },
    ],
  },
  {
    id: "contact",
    title: "Contact page",
    description: "Text above your contact details.",
    fields: [
      { path: "contact.heading", label: "Heading", kind: "text" },
      { path: "contact.intro", label: "Intro", kind: "textarea" },
    ],
  },
  {
    id: "legal",
    title: "Legal & disclaimers",
    description: "Use the exact wording required by your TRREB / PropTx agreement, and have your Broker of Record review it.",
    fields: [
      { path: "legal.idxDisclaimer", label: "Listing data disclaimer (footer)", kind: "textarea" },
      { path: "legal.trademarkNotice", label: "MLS® / REALTOR® trademark notice (footer)", kind: "textarea" },
      { path: "legal.listingDisclaimer", label: "Disclaimer on each listing page", kind: "textarea" },
      { path: "legal.privacyPolicy", label: "Privacy policy page", kind: "longtext", help: RICH_HELP },
      { path: "legal.termsOfUse", label: "Terms of use page", kind: "longtext", help: RICH_HELP },
    ],
  },
  {
    id: "branding",
    title: "Branding",
    description: "Colours used for buttons, links, map pins and highlights.",
    fields: [
      { path: "theme.brandColor", label: "Main colour", kind: "color" },
      { path: "theme.accentColor", label: "Accent colour", kind: "color", help: "Used for “New” badges and highlighted map pins." },
    ],
  },
  {
    id: "seo",
    title: "Search engines",
    description: "How the site appears in Google results and browser tabs.",
    fields: [
      { path: "seo.siteName", label: "Site name", kind: "text" },
      { path: "seo.defaultTitle", label: "Home page title", kind: "text", help: "Your name and brokerage are added automatically." },
      { path: "seo.description", label: "Description", kind: "textarea" },
    ],
  },
  {
    id: "leads",
    title: "Lead notifications",
    description: "Every enquiry is saved under Leads. Email notifications also need a Resend API key in Netlify's environment variables.",
    fields: [{ path: "leads.notifyEmail", label: "Send new leads to", kind: "email", help: "Leave blank to use the LEAD_EMAIL_TO environment variable." }],
  },
];

export function getPath(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((o, k) => (o as Record<string, unknown> | undefined)?.[k], obj);
}

export function setPath<T>(obj: T, path: string, value: unknown): T {
  const keys = path.split(".");
  const root = structuredClone(obj) as Record<string, unknown>;
  let cur = root;
  for (const k of keys.slice(0, -1)) cur = cur[k] as Record<string, unknown>;
  cur[keys.at(-1)!] = value;
  return root as T;
}

// Form value (string) → settings value
export function parseField(kind: FieldKind, raw: string): unknown {
  const value = raw.replace(/\r\n/g, "\n");
  if (kind === "lines") return value.split("\n").map((l) => l.trim()).filter(Boolean);
  if (kind === "paragraphs") return value.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  return value.trim();
}

// Settings value → form value (string)
export function formatField(kind: FieldKind, value: unknown): string {
  if (kind === "lines") return ((value as string[]) ?? []).join("\n");
  if (kind === "paragraphs") return ((value as string[]) ?? []).join("\n\n");
  return (value as string) ?? "";
}

export function sectionValues(settings: SiteSettings, section: SectionDef) {
  return Object.fromEntries(section.fields.map((f) => [f.path, formatField(f.kind, getPath(settings, f.path))]));
}
