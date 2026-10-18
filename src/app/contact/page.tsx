import type { Metadata } from "next";
import { site } from "@/config/site";
import { LeadForm } from "@/components/lead-form";

export const metadata: Metadata = {
  title: "Contact",
  description: `Contact ${site.agent.name}, ${site.agent.title} with ${site.brokerage.name}.`,
};

export default function ContactPage() {
  return (
    <div className="mx-auto grid w-full max-w-5xl gap-10 px-4 py-12 md:grid-cols-2">
      <div>
        <h1 className="text-3xl font-bold">Let&apos;s talk</h1>
        <p className="mt-3 text-slate-700">
          Buying, selling, or just curious what your home is worth? Send me a message and I&apos;ll get back to you,
          usually the same day.
        </p>
        <div className="mt-6 space-y-1 text-slate-700">
          <p className="font-semibold">{site.agent.name}, {site.agent.title}</p>
          <p className="font-semibold text-brand-700">{site.brokerage.name}</p>
          <p>{site.brokerage.address}</p>
          <p>Direct: <a className="underline" href={`tel:${site.agent.phone.replace(/[^0-9+]/g, "")}`}>{site.agent.phone}</a></p>
          <p>Email: <a className="underline" href={`mailto:${site.agent.email}`}>{site.agent.email}</a></p>
        </div>
      </div>
      <div className="rounded-2xl border border-slate-200 p-6 shadow-sm">
        <LeadForm />
      </div>
    </div>
  );
}
