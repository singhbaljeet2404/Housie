import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "About",
  description: `${site.agent.name}, ${site.agent.title} with ${site.brokerage.name}.`,
};

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold">About {site.agent.name}</h1>
      <p className="mt-1 text-lg text-slate-600">{site.agent.title} · {site.brokerage.name}</p>
      {site.agent.bio.map((p) => <p key={p} className="mt-5 leading-relaxed text-slate-700">{p}</p>)}
      <dl className="mt-8 grid gap-4 rounded-xl bg-slate-50 p-6 text-sm sm:grid-cols-2">
        <div><dt className="text-slate-500">Brokerage</dt><dd className="font-medium">{site.brokerage.name}</dd></div>
        <div><dt className="text-slate-500">Languages</dt><dd className="font-medium">{site.agent.languages.join(", ")}</dd></div>
        <div><dt className="text-slate-500">Phone</dt><dd className="font-medium">{site.agent.phone}</dd></div>
        <div><dt className="text-slate-500">Email</dt><dd className="font-medium">{site.agent.email}</dd></div>
      </dl>
      <Link href="/contact" className="mt-8 inline-block rounded-full bg-brand-600 px-6 py-3 font-semibold text-white hover:bg-brand-700">
        Get in touch
      </Link>
    </div>
  );
}
