import { Suspense } from "react";
import { requireAdmin } from "@/lib/admin-auth";
import { getSettingsFresh } from "@/lib/settings";
import { isSampleData } from "@/lib/listings";
import { listKeys } from "@/lib/storage";
import { SECTIONS, sectionValues } from "./fields";
import { SectionForm } from "./section-form";
import { PhotoForm } from "./photo-form";
import { logout } from "./actions";

export default function AdminPage() {
  return (
    <Suspense fallback={<p className="text-sm text-slate-500">Loading…</p>}>
      <Dashboard />
    </Suspense>
  );
}

async function Dashboard() {
  await requireAdmin();
  const [settings, leadKeys] = await Promise.all([getSettingsFresh(), listKeys("leads")]);
  const emailReady = Boolean(process.env.RESEND_API_KEY && (settings.leads.notifyEmail || process.env.LEAD_EMAIL_TO));

  return (
    <div className="grid gap-8 lg:grid-cols-[200px_1fr]">
      <nav className="lg:sticky lg:top-6 lg:self-start">
        <ul className="flex flex-wrap gap-2 text-sm lg:flex-col lg:gap-1">
          {SECTIONS.map((s) => (
            <li key={s.id}><a href={`#${s.id}`} className="block rounded-md px-2 py-1 text-slate-700 hover:bg-white hover:text-brand-700">{s.title}</a></li>
          ))}
        </ul>
        <form action={logout} className="mt-4">
          <button type="submit" className="px-2 text-sm text-slate-500 hover:text-red-600">Sign out</button>
        </form>
      </nav>

      <div className="min-w-0 space-y-6">
        <section className="grid gap-3 rounded-xl border border-slate-200 bg-white p-5 text-sm sm:grid-cols-3">
          <Status label="Leads received" value={String(leadKeys.length)} href="/admin/leads" />
          <Status label="Lead emails" value={emailReady ? "On" : "Off — see Lead notifications"} warn={!emailReady} />
          <Status label="Listing data" value={isSampleData ? "Sample data (not indexed)" : "Live feed"} warn={isSampleData} />
        </section>

        {SECTIONS.map((section) => (
          <section key={section.id} id={section.id} className="scroll-mt-6 rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold">{section.title}</h2>
            <p className="mb-5 text-sm text-slate-500">{section.description}</p>
            {section.id === "profile" && (
              <div className="mb-6 border-b border-slate-100 pb-6">
                <p className="mb-2 text-sm font-medium text-slate-800">Headshot</p>
                <PhotoForm photo={settings.agent.photo} name={settings.agent.name} />
              </div>
            )}
            <SectionForm section={section} values={sectionValues(settings, section)} />
          </section>
        ))}
      </div>
    </div>
  );
}

function Status({ label, value, href, warn }: { label: string; value: string; href?: string; warn?: boolean }) {
  const body = (
    <>
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-1 font-semibold ${warn ? "text-accent-600" : "text-slate-900"}`}>{value}</p>
    </>
  );
  return href ? <a href={href} className="hover:underline">{body}</a> : <div>{body}</div>;
}
