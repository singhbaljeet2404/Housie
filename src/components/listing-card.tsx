import Link from "next/link";
import type { Listing } from "@/lib/listings/types";
import { formatAddress, formatBeds, formatPrice, listingPath, propertyTypeLabel } from "@/lib/format";
import { ListingPhoto } from "./listing-photo";

export function ListingCard({ listing, compact = false }: { listing: Listing; compact?: boolean }) {
  return (
    <Link
      href={listingPath(listing)}
      className="group block overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:shadow-md"
    >
      <div className="relative">
        <ListingPhoto seed={listing.id} className={compact ? "aspect-[16/9]" : "aspect-[4/3]"} label={formatAddress(listing)} />
        {listing.daysOnMarket <= 3 && (
          <span className="absolute left-2 top-2 rounded bg-accent-500 px-2 py-0.5 text-xs font-semibold text-white">New</span>
        )}
      </div>
      <div className="space-y-1 p-3">
        <p className="text-lg font-bold text-slate-900">{formatPrice(listing.listPrice)}</p>
        <p className="text-sm text-slate-700">
          <strong>{formatBeds(listing)}</strong> bd · <strong>{listing.bathrooms}</strong> ba · {listing.sqftRange} sqft
        </p>
        <p className="truncate text-sm font-medium text-slate-900 group-hover:text-brand-600">{formatAddress(listing)}</p>
        <p className="truncate text-xs text-slate-500">
          {propertyTypeLabel(listing)} · {listing.address.neighbourhood}, {listing.address.city}
        </p>
        {/* IDX rules: show the listing brokerage on every listing display */}
        <p className="truncate text-[11px] text-slate-400">Listed by {listing.listingBrokerage}</p>
      </div>
    </Link>
  );
}
