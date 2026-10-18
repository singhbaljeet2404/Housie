# Housie — GTA real estate search site

Lead-generation website for an Ontario sales representative at **HomeLife Miracle Realty Ltd., Brokerage**:
a HouseSigma-style map search over MLS® listings, with every enquiry going straight to the agent.

This is **Phase 1 (public IDX site)** of the build plan, running on **fictional sample data** until the
PropTx IDX agreement and data vendor are in place.

## What's built

| Area | Where |
|---|---|
| Map search: MapLibre map, clustered price pins, list panel, filters (price, beds, baths, type, listing date, sort), autocomplete, shareable URLs, mobile map/list toggle | `/map` · `src/components/map/` |
| Listing pages: gallery, key facts, rooms, location map, mortgage calculator (Canadian semi-annual compounding), "Book a showing"/question form, similar listings, schema.org JSON-LD | `/listings/[city]/[address-id]` |
| SEO landing pages per city and city × property type (8 cities × 4 types), sitemap, robots | `/real-estate/...`, `sitemap.ts`, `robots.ts` |
| Home, About, Contact, draft Privacy & Terms pages | `src/app/` |
| Lead capture: validated server action, honeypot, CASL marketing-consent checkbox, delivery via Resend email and/or webhook | `src/app/actions.ts`, `src/lib/leads.ts` |
| Compliance basics: brokerage name in the header and footer on every page, listing brokerage on every listing, MLS®/REALTOR® trademark notice, sample-data banner | `header.tsx`, `footer.tsx` |

## Run it

```bash
npm install
cp .env.example .env.local   # optional
npm run dev                  # http://localhost:3000
npm test                     # unit tests (vitest)
npm run lint && npm run typecheck
npm run build && npm start
```

Stack: Next.js 16 (App Router, Cache Components), React 19, Tailwind CSS 4, MapLibre GL 6, Zod.

## Where to change things

- **Your name, phone, email, bio, brokerage address** → `src/config/site.ts` (every `TODO` must be filled before launch).
- **Data source** → `src/lib/listings/index.ts`. Pages only call the cached helpers there. To go live, add a provider
  implementing `ListingProvider` (`src/lib/listings/types.ts`), e.g. a Repliers adapter, and set `LISTINGS_PROVIDER`.
- **Photos** → `src/components/listing-photo.tsx` is a placeholder; replace it with `<Image>` pointed at the feed's photo URLs.
- **Colours** → `@theme` tokens in `src/app/globals.css`.

## Before launch (not done yet)

- Replace the disclaimer text marked `TODO(compliance)` with the exact TRREB/PropTx wording from your agreement.
- Have the Privacy Policy and Terms reviewed; get Broker of Record sign-off on the site.
- Connect the live listing provider and real photos; remove the sample-data banner (automatic when `LISTINGS_PROVIDER` ≠ `sample`).
- Configure lead delivery (`RESEND_API_KEY` + `LEAD_EMAIL_TO`, or `LEAD_WEBHOOK_URL`) and add rate limiting on the lead form.
- Phase 2 (VOW): accounts, sold data behind registration, saved searches, alerts.
