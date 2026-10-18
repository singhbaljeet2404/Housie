import type { Metadata } from "next";
import { site } from "@/config/site";

export const metadata: Metadata = { title: "Terms of Use" };

// TODO(compliance): align with the terms required by your TRREB / PropTx IDX (and later VOW) agreements.
export default function TermsPage() {
  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-12 text-slate-700 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-slate-900 [&_p]:mt-3">
      <h1 className="text-3xl font-bold text-slate-900">Terms of use</h1>
      <p className="text-sm text-slate-500">Draft — pending review by {site.brokerage.name}.</p>
      <h2>Listing information</h2>
      <p>
        Listing information is provided for consumers&apos; personal, non-commercial use and may not be used for any
        purpose other than to identify prospective properties you may be interested in purchasing or leasing. Data is
        deemed reliable but is not guaranteed accurate.
      </p>
      <h2>No automated access</h2>
      <p>Scraping, bulk downloading or automated collection of listing data from this site is prohibited.</p>
      <h2>Brokerage</h2>
      <p>
        {site.agent.name} is a {site.agent.title.toLowerCase()} registered with {site.brokerage.name}. This website is
        not intended to solicit buyers or sellers already under contract with another brokerage.
      </p>
    </article>
  );
}
