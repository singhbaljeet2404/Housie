import Link from "next/link";
import { site } from "@/config/site";

const NAV = [
  { href: "/map", label: "Map search" },
  { href: "/real-estate", label: "Cities" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4">
        <Link href="/" className="flex flex-col leading-tight">
          <span className="text-lg font-bold text-brand-700">{site.agent.name}</span>
          {/* RECO: brokerage name shown prominently on every page */}
          <span className="text-xs font-semibold text-slate-600">
            {site.agent.title} · {site.brokerage.name}
          </span>
        </Link>
        <nav className="ml-auto hidden items-center gap-5 text-sm font-medium text-slate-700 md:flex">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-brand-600">
              {item.label}
            </Link>
          ))}
        </nav>
        <a
          href={`tel:${site.agent.phone.replace(/[^0-9+]/g, "")}`}
          className="ml-auto rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 md:ml-0"
        >
          <span className="sm:hidden">Call</span>
          <span className="hidden sm:inline">Call {site.agent.phone}</span>
        </a>
      </div>
      <nav className="flex gap-5 overflow-x-auto border-t border-slate-100 px-4 py-2 text-sm font-medium text-slate-700 md:hidden">
        {NAV.map((item) => (
          <Link key={item.href} href={item.href} className="whitespace-nowrap">
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
