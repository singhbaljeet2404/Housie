import Link from "next/link";
import { site } from "@/config/site";
import { isSampleData } from "@/lib/listings";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-slate-50 text-sm text-slate-600">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-3">
        <div>
          <p className="font-semibold text-slate-900">
            {site.agent.name}, {site.agent.title}
          </p>
          <p className="mt-1 text-base font-semibold text-brand-700">{site.brokerage.name}</p>
          <p className="mt-1">{site.brokerage.address}</p>
          <p>Office: {site.brokerage.phone}</p>
          <p className="mt-3">
            Direct: <a href={`tel:${site.agent.phone.replace(/[^0-9+]/g, "")}`} className="underline">{site.agent.phone}</a>
            <br />
            <a href={`mailto:${site.agent.email}`} className="underline">{site.agent.email}</a>
          </p>
        </div>
        <div>
          <p className="font-semibold text-slate-900">Explore</p>
          <ul className="mt-2 space-y-1">
            <li><Link href="/map" className="hover:underline">Map search</Link></li>
            <li><Link href="/real-estate" className="hover:underline">Homes for sale by city</Link></li>
            <li><Link href="/about" className="hover:underline">About me</Link></li>
            <li><Link href="/contact" className="hover:underline">Contact</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-slate-900">Legal</p>
          <ul className="mt-2 space-y-1">
            <li><Link href="/privacy" className="hover:underline">Privacy policy</Link></li>
            <li><Link href="/terms" className="hover:underline">Terms of use</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-200">
        <div className="mx-auto max-w-7xl space-y-2 px-4 py-6 text-xs leading-relaxed text-slate-500">
          {isSampleData && (
            <p className="font-semibold text-accent-600">
              Development preview: all listings shown are fictional sample data, not real MLS® listings.
            </p>
          )}
          {/* TODO(compliance): replace with the exact TRREB / PropTx IDX disclaimer wording required by your data agreement. */}
          <p>
            The listing data on this website is provided in part by the Toronto Regional Real Estate Board and is
            deemed reliable but not guaranteed. It is intended for consumers&apos; personal, non-commercial use and may
            not be used for any purpose other than to identify prospective properties consumers may be interested in
            purchasing.
          </p>
          <p>
            The trademarks MLS®, Multiple Listing Service® and the associated logos are owned by The Canadian Real
            Estate Association (CREA) and identify the quality of services provided by real estate professionals who
            are members of CREA. The trademarks REALTOR®, REALTORS® and the REALTOR® logo are controlled by CREA and
            identify real estate professionals who are members of CREA.
          </p>
          <p>
            Not intended to solicit buyers or sellers already under contract with a brokerage. © {site.brokerage.name}.
          </p>
        </div>
      </div>
    </footer>
  );
}
