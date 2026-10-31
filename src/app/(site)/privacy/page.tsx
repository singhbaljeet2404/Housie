import type { Metadata } from "next";
import { fillPlaceholders, getSettings } from "@/lib/settings";
import { RichText } from "@/components/rich-text";

export const metadata: Metadata = { title: "Privacy Policy" };

// Content is edited in /admin → Legal & disclaimers.
export default async function PrivacyPage() {
  const site = await getSettings();
  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-12 text-slate-700">
      <h1 className="text-3xl font-bold text-slate-900">Privacy policy</h1>
      <RichText text={fillPlaceholders(site.legal.privacyPolicy, site)} />
    </article>
  );
}
