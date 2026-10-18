import { PROPERTY_TYPE_LABELS, type Listing } from "./listings/types";

const cad = new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 });

export function formatPrice(value: number) {
  return cad.format(value);
}

// "$1.25M", "$899K" — used for map pins
export function formatPriceShort(value: number) {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(value >= 10_000_000 ? 1 : 2).replace(/\.?0+$/, "")}M`;
  return `$${Math.round(value / 1000)}K`;
}

export function formatAddress(listing: Pick<Listing, "address">) {
  const { unit, streetNumber, streetName } = listing.address;
  return `${unit ? `${unit} - ` : ""}${streetNumber} ${streetName}`;
}

export function formatBeds(listing: Pick<Listing, "bedrooms" | "bedroomsPlus">) {
  return listing.bedroomsPlus ? `${listing.bedrooms}+${listing.bedroomsPlus}` : String(listing.bedrooms);
}

export function propertyTypeLabel(listing: Pick<Listing, "propertyType">) {
  return PROPERTY_TYPE_LABELS[listing.propertyType];
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// SEO-friendly listing URL whose last segment is always the opaque id:
// /listings/brampton/123-maple-ridge-dr-aB3dE5fG7hJ9
export function listingPath(listing: Pick<Listing, "id" | "address">) {
  return `/listings/${listing.address.citySlug}/${slugify(formatAddress(listing))}-${listing.id}`;
}

export function idFromListingSlug(slug: string) {
  const id = slug.slice(slug.lastIndexOf("-") + 1);
  return /^[A-Za-z0-9]{12}$/.test(id) ? id : null;
}

export function formatDaysOnMarket(days: number) {
  if (days === 0) return "Listed today";
  if (days === 1) return "1 day on market";
  return `${days} days on market`;
}
