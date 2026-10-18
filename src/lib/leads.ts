// Lead capture: validation and delivery. Leads go to the agent by email
// (Resend) and/or to a CRM webhook; with neither configured they are logged.

import { z } from "zod";
import { site } from "@/config/site";

export const LEAD_TYPES = ["contact", "showing", "listing-question"] as const;

export const leadSchema = z.object({
  type: z.enum(LEAD_TYPES),
  name: z.string().trim().min(2, "Please enter your name").max(100),
  email: z.email("Please enter a valid email").max(200),
  phone: z
    .string()
    .trim()
    .max(30)
    .regex(/^[0-9+()\-.\s]*$/, "Please enter a valid phone number")
    .optional()
    .transform((v) => v || undefined),
  message: z.string().trim().max(2000).optional().transform((v) => v || undefined),
  preferredTime: z.string().trim().max(100).optional().transform((v) => v || undefined),
  listingId: z.string().regex(/^[A-Za-z0-9]{12}$/).optional(),
  listingAddress: z.string().max(200).optional(),
  pageUrl: z.string().max(500).optional(),
  // CASL: marketing email needs separate express consent; replying to this enquiry does not.
  marketingConsent: z.boolean(),
});

export type Lead = z.infer<typeof leadSchema>;

export function leadFromFormData(formData: FormData) {
  const field = (key: string) => {
    const value = formData.get(key);
    return typeof value === "string" && value !== "" ? value : undefined;
  };
  return leadSchema.safeParse({
    type: field("type"),
    name: field("name") ?? "",
    email: field("email") ?? "",
    phone: field("phone"),
    message: field("message"),
    preferredTime: field("preferredTime"),
    listingId: field("listingId"),
    listingAddress: field("listingAddress"),
    pageUrl: field("pageUrl"),
    marketingConsent: formData.get("marketingConsent") === "on",
  });
}

const TYPE_LABELS: Record<Lead["type"], string> = {
  contact: "General enquiry",
  showing: "Showing request",
  "listing-question": "Listing question",
};

export function leadSubject(lead: Lead) {
  return `New lead: ${TYPE_LABELS[lead.type]} from ${lead.name}${lead.listingAddress ? ` — ${lead.listingAddress}` : ""}`;
}

export function leadText(lead: Lead) {
  return [
    `Type: ${TYPE_LABELS[lead.type]}`,
    `Name: ${lead.name}`,
    `Email: ${lead.email}`,
    lead.phone && `Phone: ${lead.phone}`,
    lead.listingAddress && `Listing: ${lead.listingAddress}${lead.listingId ? ` (${site.url}/l/${lead.listingId})` : ""}`,
    lead.preferredTime && `Preferred time: ${lead.preferredTime}`,
    lead.message && `\n${lead.message}\n`,
    `Marketing consent (CASL): ${lead.marketingConsent ? "yes" : "no"}`,
    lead.pageUrl && `Submitted from: ${lead.pageUrl}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export async function deliverLead(lead: Lead) {
  const receivedAt = new Date().toISOString();
  const tasks: Promise<unknown>[] = [];

  const resendKey = process.env.RESEND_API_KEY;
  const to = process.env.LEAD_EMAIL_TO;
  if (resendKey && to) {
    tasks.push(
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: process.env.LEAD_EMAIL_FROM ?? "Leads <onboarding@resend.dev>",
          to: to.split(",").map((s) => s.trim()),
          reply_to: lead.email,
          subject: leadSubject(lead),
          text: leadText(lead),
        }),
      }).then(assertOk("Resend")),
    );
  }

  const webhook = process.env.LEAD_WEBHOOK_URL;
  if (webhook) {
    tasks.push(
      fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...lead, receivedAt }),
      }).then(assertOk("Lead webhook")),
    );
  }

  if (tasks.length === 0) {
    console.info(`[lead] no delivery configured — ${receivedAt}\n${leadText(lead)}`);
    return;
  }

  const results = await Promise.allSettled(tasks);
  const failures = results.filter((r): r is PromiseRejectedResult => r.status === "rejected");
  failures.forEach((f) => console.error("[lead] delivery failed:", f.reason));
  // Succeed if at least one channel received the lead.
  if (failures.length === tasks.length) throw new Error("Lead delivery failed");
}

function assertOk(label: string) {
  return async (res: Response) => {
    if (!res.ok) throw new Error(`${label} responded ${res.status}: ${await res.text().catch(() => "")}`);
  };
}
