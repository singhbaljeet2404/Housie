// Single source of truth for branding, contact details and RECO-required
// brokerage identification. Anything marked TODO must be filled in before launch.

export const site = {
  name: "Housie",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  tagline: "Search every home for sale across the GTA — with a local agent on your side.",

  agent: {
    name: "Your Name", // TODO: your name exactly as registered with RECO
    title: "Sales Representative",
    phone: "(000) 000-0000", // TODO
    email: "you@example.com", // TODO: public contact email
    languages: ["English"], // TODO: add the languages you work in
    bio: [
      // TODO: replace with your own bio
      "I help buyers and sellers across Brampton, Mississauga and the rest of the GTA make confident moves — from first homes to upsizing and investment properties.",
      "Every listing on this site comes straight from the MLS® System, and every enquiry comes directly to me.",
    ],
  },

  brokerage: {
    // RECO / TRESA: the brokerage name must appear clearly and prominently.
    name: "HomeLife Miracle Realty Ltd., Brokerage",
    address: "TODO: brokerage office address",
    phone: "TODO: brokerage office phone",
  },

  serviceAreas: ["brampton", "mississauga", "toronto", "caledon", "vaughan", "milton", "oakville", "markham"],
} as const;

export type Site = typeof site;
