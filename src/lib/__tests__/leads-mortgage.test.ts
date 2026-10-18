import { describe, expect, it } from "vitest";
import { leadFromFormData, leadText } from "../leads";
import { monthlyPayment } from "../mortgage";

function form(values: Record<string, string>) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(values)) fd.set(k, v);
  return fd;
}

describe("lead validation", () => {
  it("accepts a valid showing request", () => {
    const result = leadFromFormData(form({ type: "showing", name: "Jane Doe", email: "jane@example.com", phone: "(416) 555-0100", preferredTime: "Sat", marketingConsent: "on" }));
    expect(result.success).toBe(true);
    expect(result.data).toMatchObject({ type: "showing", marketingConsent: true, phone: "(416) 555-0100" });
    expect(leadText(result.data!)).toContain("Marketing consent (CASL): yes");
  });

  it("rejects bad input and defaults consent to false", () => {
    const bad = leadFromFormData(form({ type: "contact", name: "J", email: "nope", phone: "call me" }));
    expect(bad.success).toBe(false);
    expect(bad.error!.issues.map((i) => i.path[0]).sort()).toEqual(["email", "name", "phone"]);
    const ok = leadFromFormData(form({ type: "contact", name: "Jo", email: "jo@example.com" }));
    expect(ok.data?.marketingConsent).toBe(false);
  });

  it("rejects unknown lead types", () => {
    expect(leadFromFormData(form({ type: "spam", name: "Jo", email: "jo@example.com" })).success).toBe(false);
  });
});

describe("mortgage", () => {
  it("matches a known Canadian semi-annual compounding payment", () => {
    // $500,000 at 5% over 25 years ≈ $2,908.02/month with semi-annual compounding
    expect(monthlyPayment(500_000, 5, 25)).toBeCloseTo(2908.02, 1);
  });
  it("handles zero rate and zero principal", () => {
    expect(monthlyPayment(120_000, 0, 10)).toBe(1000);
    expect(monthlyPayment(0, 5, 25)).toBe(0);
  });
});
