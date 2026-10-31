import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-5 px-4 text-sm">
          <Link href="/admin" className="font-bold text-brand-700">Site admin</Link>
          <Link href="/admin" className="text-slate-700 hover:text-brand-600">Settings</Link>
          <Link href="/admin/leads" className="text-slate-700 hover:text-brand-600">Leads</Link>
          <Link href="/" target="_blank" className="ml-auto text-slate-700 hover:text-brand-600">View site ↗</Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
    </div>
  );
}
