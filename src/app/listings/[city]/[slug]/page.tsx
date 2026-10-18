import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { site } from "@/config/site";
import { getAllListingIds, getListing, searchListings, type Listing } from "@/lib/listings";
import {
  formatAddress,
  formatBeds,
  formatDaysOnMarket,
  formatPrice,
  idFromListingSlug,
  listingPath,
  propertyTypeLabel,
} from "@/lib/format";
import { ListingCard } from "@/components/listing-card";
import { LeadForm } from "@/components/lead-form";
import { PhotoGallery } from "@/components/listing/photo-gallery";
import { ListingMap } from "@/components/listing/listing-map";
import { MortgageCalculator } from "@/components/listing/mortgage-calculator";

export async function generateStaticParams() {
  const ids = await getAllListingIds();
  const listings = await Promise.all(ids.map((id) => getListing(id)));
  return listings
    .filter((l): l is Listing => l !== null)
    .map((l) => {
      const [, , city, slug] = listingPath(l).split("/");
      return { city, slug };
    });
}

async function load(params: PageProps<"/listings/[city]/[slug]">["params"]) {
  const { city, slug } = await params;
  const id = idFromListingSlug(slug);
  const listing = id ? await getListing(id) : null;
  if (!listing) notFound();
  // Addresses can be corrected in the feed; always serve the canonical URL.
  if (listingPath(listing) !== `/listings/${city}/${slug}`) permanentRedirect(listingPath(listing));
  return listing;
}

export async function generateMetadata({ params }: PageProps<"/listings/[city]/[slug]">): Promise<Metadata> {
  const listing = await load(params);
  const address = `${formatAddress(listing)}, ${listing.address.city}`;
  return {
    title: `${address} — ${formatPrice(listing.listPrice)}`,
    description: `${propertyTypeLabel(listing)} for sale at ${address}, ${listing.address.neighbourhood}: ${formatBeds(listing)} bedrooms, ${listing.bathrooms} bathrooms, ${listing.sqftRange} sqft. MLS® ${listing.mlsNumber}.`,
    alternates: { canonical: listingPath(listing) },
  };
}

export default async function ListingPage({ params }: PageProps<"/listings/[city]/[slug]">) {
  const listing = await load(params);
  const address = formatAddress(listing);
  const fullAddress = `${address}, ${listing.address.city}, ON ${listing.address.postalCode}`;

  const nearby = (
    await searchListings({ city: listing.address.citySlug, types: [listing.propertyType], limit: 5 })
  ).listings
    .filter((l) => l.id !== listing.id)
    .slice(0, 4);

  const facts: [string, string][] = [
    ["Property type", propertyTypeLabel(listing)],
    ["Bedrooms", formatBeds(listing)],
    ["Bathrooms", String(listing.bathrooms)],
    ["Size", `${listing.sqftRange} sqft`],
    ["Parking", String(listing.parking)],
    ...(listing.lotSize ? [["Lot size", listing.lotSize] as [string, string]] : []),
    ...(listing.yearBuilt ? [["Year built", String(listing.yearBuilt)] as [string, string]] : []),
    ["Taxes", `${formatPrice(listing.taxes)} (${listing.taxYear})`],
    ...(listing.maintenanceFee ? [["Maintenance", `${formatPrice(listing.maintenanceFee)} / month`] as [string, string]] : []),
    ["Listed", `${listing.listDate} · ${formatDaysOnMarket(listing.daysOnMarket)}`],
    ["MLS® #", listing.mlsNumber],
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: fullAddress,
    url: `${site.url}${listingPath(listing)}`,
    datePosted: listing.listDate,
    offers: { "@type": "Offer", price: listing.listPrice, priceCurrency: "CAD" },
    about: {
      "@type": listing.propertyType === "condo" ? "Apartment" : "SingleFamilyResidence",
      numberOfRooms: listing.bedrooms + listing.bedroomsPlus,
      address: {
        "@type": "PostalAddress",
        streetAddress: address,
        addressLocality: listing.address.city,
        addressRegion: "ON",
        postalCode: listing.address.postalCode,
        addressCountry: "CA",
      },
      geo: { "@type": "GeoCoordinates", latitude: listing.lat, longitude: listing.lng },
    },
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <nav className="mb-4 text-sm text-slate-500" aria-label="Breadcrumb">
        <Link href="/real-estate" className="hover:underline">Homes for sale</Link>
        {" › "}
        <Link href={`/real-estate/${listing.address.citySlug}`} className="hover:underline">{listing.address.city}</Link>
        {" › "}
        <span className="text-slate-700">{address}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="min-w-0 space-y-8">
          <PhotoGallery seed={listing.id} count={listing.photoCount} label={address} />

          <section>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-3xl font-bold">{formatPrice(listing.listPrice)}</p>
                <h1 className="mt-1 text-xl font-semibold">{address}</h1>
                <p className="text-slate-600">
                  {listing.address.neighbourhood}, {listing.address.city}, ON {listing.address.postalCode}
                </p>
              </div>
              <div className="flex gap-6 text-center">
                <div><p className="text-xl font-bold">{formatBeds(listing)}</p><p className="text-xs text-slate-500">Beds</p></div>
                <div><p className="text-xl font-bold">{listing.bathrooms}</p><p className="text-xs text-slate-500">Baths</p></div>
                <div><p className="text-xl font-bold">{listing.parking}</p><p className="text-xs text-slate-500">Parking</p></div>
              </div>
            </div>
            <p className="mt-3 text-sm text-slate-500">
              {propertyTypeLabel(listing)} · {formatDaysOnMarket(listing.daysOnMarket)} · MLS® {listing.mlsNumber}
            </p>
            {/* IDX rules: listing brokerage shown with every listing */}
            <p className="mt-1 text-sm text-slate-500">Listing courtesy of {listing.listingBrokerage}</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">About this home</h2>
            <p className="mt-2 leading-relaxed text-slate-700">{listing.description}</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {listing.features.map((f) => (
                <li key={f} className="rounded-full bg-brand-50 px-3 py-1 text-sm text-brand-700">{f}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold">Key facts</h2>
            <dl className="mt-3 grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
              {facts.map(([k, v]) => (
                <div key={k} className="flex justify-between border-b border-slate-100 py-1.5">
                  <dt className="text-slate-500">{k}</dt>
                  <dd className="font-medium text-slate-900">{v}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section>
            <h2 className="text-lg font-semibold">Rooms</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-slate-500">
                  <tr><th className="py-1.5 font-medium">Room</th><th className="font-medium">Level</th><th className="font-medium">Dimensions</th></tr>
                </thead>
                <tbody>
                  {listing.rooms.map((r) => (
                    <tr key={r.name} className="border-t border-slate-100">
                      <td className="py-1.5">{r.name}</td><td>{r.level}</td><td>{r.dimensions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">Location</h2>
            <ListingMap lng={listing.lng} lat={listing.lat} />
          </section>

          <MortgageCalculator price={listing.listPrice} />
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-xl border border-slate-200 p-5 shadow-sm">
            <p className="text-sm text-slate-500">Interested in this home?</p>
            <p className="font-semibold">{site.agent.name}</p>
            <p className="mb-4 text-xs text-slate-500">{site.agent.title}, {site.brokerage.name}</p>
            <LeadForm
              allowShowing
              defaultType="showing"
              listingId={listing.id}
              listingAddress={`${address}, ${listing.address.city} (MLS® ${listing.mlsNumber})`}
              defaultMessage={`I'm interested in ${address}, ${listing.address.city}.`}
            />
          </div>
        </aside>
      </div>

      {nearby.length > 0 && (
        <section className="mt-12">
          <h2 className="text-lg font-semibold">
            More {propertyTypeLabel(listing).toLowerCase()} listings in {listing.address.city}
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {nearby.map((l) => <ListingCard key={l.id} listing={l} />)}
          </div>
        </section>
      )}

      {/* TODO(compliance): replace with the TRREB / PropTx listing-level disclaimer from your IDX agreement. */}
      <p className="mt-10 text-xs leading-relaxed text-slate-500">
        Information deemed reliable but not guaranteed. Listing information is provided by the listing brokerage and may
        change without notice. Measurements and room dimensions are approximate.
      </p>
    </div>
  );
}
