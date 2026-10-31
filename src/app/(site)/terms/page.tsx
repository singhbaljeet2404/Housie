import type { Metadata } from "next";
import { fillPlaceholders, getSettings } from "@/lib/settings";
import { RichText } from "@/components/rich-text";

export const metadata: Metadata = { title: "Terms of Use" };

// Content is edited in /admin → Legal & disclaimers.
export default async function TermsPage() {
  const site = await getSettings();
  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-12 text-slate-700">
      <h1 className="text-3xl font-bold text-slate-900">Terms of use</h1>
      <RichText text={fillPlaceholders(site.legal.termsOfUse, site)} />
    </article>
  );
}
