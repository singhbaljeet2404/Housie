import { Suspense } from "react";
import { requireAdmin } from "@/lib/admin-auth";
import { listLeads } from "@/lib/lead-store";
import { removeLead } from "../actions";

const TYPE_LABELS: Record<string, string> = {
  contact: "General enquiry",
  showing: "Showing request",
  "listing-question": "Listing question",
};

export default function LeadsPage() {
  return (
    <Suspense fallback={<p className="text-sm text-slate-500">Loading…</p>}>
      <Leads />
    </Suspense>
  );
}

async function Leads() {
  await requireAdmin();
  const leads = await listLeads();
  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Leads</h1>
          <p className="text-sm text-slate-500">{leads.length} {leads.length === 1 ? "enquiry" : "enquiries"}, newest first.</p>
        </div>
        {leads.length > 0 && (
          <a href="/admin/leads/export" className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:border-brand-500">Download CSV</a>
        )}
      </div>
      {leads.length === 0 && <p className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">No leads yet. Enquiries from the site’s forms will show up here.</p>}
      <ul className="space-y-3">
        {leads.map((lead) => (
          <li key={lead.id} className="rounded-xl border border-slate-200 bg-white p-5 text-sm">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-slate-900">{lead.name} <span className="ml-2 rounded bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">{TYPE_LABELS[lead.type] ?? lead.type}</span></p>
                <p className="text-slate-600">
                  <a href={`mailto:${lead.email}`} className="underline">{lead.email}</a>
                  {lead.phone && <> · <a href={`tel:${lead.phone}`} className="underline">{lead.phone}</a></>}
                </p>
              </div>
              <time dateTime={lead.receivedAt} className="text-xs text-slate-500">{new Date(lead.receivedAt).toLocaleString("en-CA", { timeZone: "America/Toronto", dateStyle: "medium", timeStyle: "short" })}</time>
            </div>
            {lead.listingAddress && <p className="mt-2 text-slate-700">Listing: {lead.listingId ? <a href={`/l/${lead.listingId}`} target="_blank" className="underline">{lead.listingAddress}</a> : lead.listingAddress}</p>}
            {lead.preferredTime && <p className="text-slate-700">Preferred time: {lead.preferredTime}</p>}
            {lead.message && <p className="mt-2 whitespace-pre-line rounded-lg bg-slate-50 p-3 text-slate-800">{lead.message}</p>}
            <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
              <span>Marketing consent (CASL): {lead.marketingConsent ? "yes" : "no"}</span>
              <form action={removeLead.bind(null, lead.id)}>
                <button type="submit" className="text-red-600 hover:underline">Delete</button>
              </form>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
