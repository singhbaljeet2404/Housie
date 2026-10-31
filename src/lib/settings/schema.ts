// Everything an admin can edit from /admin. Defaults are what the site shows
// before anything has been saved.

import { z } from "zod";

const text = (max = 200) => z.string().trim().max(max);
const longText = (max = 20_000) => z.string().trim().max(max);
const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Use a hex colour like #1d5190");
const lines = (maxItems = 20, maxLen = 300) => z.array(z.string().trim().min(1).max(maxLen)).max(maxItems);

export const settingsSchema = z.object({
  agent: z.object({
    name: text(100).min(1, "Required"),
    title: text(100).min(1, "Required"),
    phone: text(40),
    email: z.email("Enter a valid email").max(200),
    languages: lines(12, 40),
    bio: lines(10, 2000), // one paragraph per entry
    photo: z.string().max(200).optional(), // media key, set by the photo upload
  }),
  brokerage: z.object({
    name: text(150).min(1, "Required"),
    address: text(300),
    phone: text(40),
  }),
  home: z.object({
    heroTitle: text(120).min(1, "Required"),
    heroSubtitle: text(300),
    justListedTitle: text(80),
    agentSectionLabel: text(60),
    highlights: lines(8, 200),
    contactCardTitle: text(120),
  }),
  contact: z.object({
    heading: text(120),
    intro: text(1000),
  }),
  legal: z.object({
    idxDisclaimer: longText(4000),
    trademarkNotice: longText(2000),
    listingDisclaimer: longText(2000),
    privacyPolicy: longText(),
    termsOfUse: longText(),
  }),
  theme: z.object({
    brandColor: hex,
    accentColor: hex,
  }),
  seo: z.object({
    siteName: text(80).min(1, "Required"),
    defaultTitle: text(160),
    description: text(300),
  }),
  leads: z.object({
    // Overrides the LEAD_EMAIL_TO environment variable when set.
    notifyEmail: z.union([z.literal(""), z.email("Enter a valid email")]),
  }),
});

export type SiteSettings = z.infer<typeof settingsSchema>;

export const DEFAULT_SETTINGS: SiteSettings = {
  agent: {
    name: "Your Name",
    title: "Sales Representative",
    phone: "(000) 000-0000",
    email: "you@example.com",
    languages: ["English"],
    bio: [
      "I help buyers and sellers across Brampton, Mississauga and the rest of the GTA make confident moves — from first homes to upsizing and investment properties.",
      "Every listing on this site comes straight from the MLS® System, and every enquiry comes directly to me.",
    ],
  },
  brokerage: {
    name: "HomeLife Miracle Realty Ltd., Brokerage",
    address: "Brokerage office address",
    phone: "Brokerage office phone",
  },
  home: {
    heroTitle: "Find your next home in the GTA",
    heroSubtitle: "Search every home for sale across the GTA — with a local agent on your side.",
    justListedTitle: "Just listed",
    agentSectionLabel: "Your local agent",
    highlights: [
      "Private showings, usually within 24 hours",
      "Comparable sales and pricing advice for any home you like",
      "Negotiation and paperwork handled start to finish",
    ],
    contactCardTitle: "Have a question? Send me a message",
  },
  contact: {
    heading: "Let's talk",
    intro:
      "Buying, selling, or just curious what your home is worth? Send me a message and I'll get back to you, usually the same day.",
  },
  legal: {
    // TODO(compliance): replace with the exact TRREB / PropTx wording from your data agreement.
    idxDisclaimer:
      "The listing data on this website is provided in part by the Toronto Regional Real Estate Board and is deemed reliable but not guaranteed. It is intended for consumers' personal, non-commercial use and may not be used for any purpose other than to identify prospective properties consumers may be interested in purchasing.",
    trademarkNotice:
      "The trademarks MLS®, Multiple Listing Service® and the associated logos are owned by The Canadian Real Estate Association (CREA) and identify the quality of services provided by real estate professionals who are members of CREA. The trademarks REALTOR®, REALTORS® and the REALTOR® logo are controlled by CREA and identify real estate professionals who are members of CREA.",
    listingDisclaimer:
      "Information deemed reliable but not guaranteed. Listing information is provided by the listing brokerage and may change without notice. Measurements and room dimensions are approximate.",
    privacyPolicy: [
      "## Who we are",
      "This website is operated by {agent}, {title} with {brokerage}. We follow the Personal Information Protection and Electronic Documents Act (PIPEDA).",
      "## What we collect",
      "When you submit a form we collect the details you provide — your name, email, phone number and message — and the page you sent it from. We use basic, privacy-respecting analytics to understand how the site is used.",
      "## How we use it",
      "Your details are used only to respond to your enquiry and to provide real estate services you request. We send listing updates or other marketing email only if you have given express consent, and every such email includes an unsubscribe link, as required by Canada's Anti-Spam Legislation (CASL).",
      "## Sharing",
      "We do not sell your personal information. It may be shared with {brokerage} as required for brokerage record-keeping, and with service providers (such as email delivery) who process it on our behalf.",
      "## Your choices",
      "You can ask to access, correct or delete your information, or withdraw consent, by emailing {email}.",
    ].join("\n\n"),
    termsOfUse: [
      "## Listing information",
      "Listing information is provided for consumers' personal, non-commercial use and may not be used for any purpose other than to identify prospective properties you may be interested in purchasing or leasing. Data is deemed reliable but is not guaranteed accurate.",
      "## No automated access",
      "Scraping, bulk downloading or automated collection of listing data from this site is prohibited.",
      "## Brokerage",
      "{agent} is a {title} registered with {brokerage}. This website is not intended to solicit buyers or sellers already under contract with another brokerage.",
    ].join("\n\n"),
  },
  theme: {
    brandColor: "#1d5190",
    accentColor: "#e8833a",
  },
  seo: {
    siteName: "Housie",
    defaultTitle: "GTA Homes for Sale",
    description:
      "Search MLS® listings across Brampton, Mississauga, Toronto and the GTA with a local Sales Representative.",
  },
  leads: {
    notifyEmail: "",
  },
};

// Saved settings may predate newly added fields; fill gaps from the defaults.
export function withDefaults(stored: unknown): SiteSettings {
  const merged = deepMerge(DEFAULT_SETTINGS, stored);
  const parsed = settingsSchema.safeParse(merged);
  return parsed.success ? parsed.data : DEFAULT_SETTINGS;
}

function deepMerge<T>(base: T, override: unknown): T {
  if (!isPlainObject(base) || !isPlainObject(override)) return (override === undefined ? base : override) as T;
  const out: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(override)) {
    out[key] = key in out ? deepMerge(out[key], value) : value;
  }
  return out as T;
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}
