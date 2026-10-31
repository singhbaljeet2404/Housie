import type { Metadata } from "next";
import { getSettings } from "@/lib/settings";
import { LeadForm } from "@/components/lead-form";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSettings();
  return { title: "Contact", description: `Contact ${site.agent.name}, ${site.agent.title} with ${site.brokerage.name}.` };
}

export default async function ContactPage() {
  const site = await getSettings();
  return (
    <div className="mx-auto grid w-full max-w-5xl gap-10 px-4 py-12 md:grid-cols-2">
      <div>
        <h1 className="text-3xl font-bold">{site.contact.heading}</h1>
        <p className="mt-3 text-slate-700">{site.contact.intro}</p>
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
