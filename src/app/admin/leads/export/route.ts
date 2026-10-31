import { isAdmin } from "@/lib/admin-auth";
import { listLeads } from "@/lib/lead-store";

const COLUMNS = ["receivedAt", "type", "name", "email", "phone", "listingAddress", "preferredTime", "message", "marketingConsent", "pageUrl"] as const;

function csvCell(value: unknown) {
  let s = value == null ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`; // stop spreadsheet formula injection
  return `"${s.replace(/"/g, '""')}"`;
}

export async function GET() {
  if (!(await isAdmin())) return new Response("Unauthorized", { status: 401 });
  const leads = await listLeads();
  const rows = [COLUMNS.join(","), ...leads.map((l) => COLUMNS.map((c) => csvCell(l[c])).join(","))];
  return new Response(rows.join("\r\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="leads.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
