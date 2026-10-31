import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { checkPassword, createSessionValue, verifySessionValue } from "../admin-auth";
import { DEFAULT_SETTINGS, settingsSchema, withDefaults } from "../settings/schema";
import { SECTIONS, formatField, getPath, parseField, setPath } from "../../app/admin/fields";

describe("admin sessions", () => {
  beforeEach(() => {
    process.env.ADMIN_PASSWORD = "correct horse";
  });
  afterEach(() => {
    delete process.env.ADMIN_PASSWORD;
    delete process.env.ADMIN_SESSION_SECRET;
  });

  it("checks the password", () => {
    expect(checkPassword("correct horse")).toBe(true);
    expect(checkPassword("wrong")).toBe(false);
    delete process.env.ADMIN_PASSWORD;
    expect(checkPassword("")).toBe(false);
  });

  it("accepts its own session and rejects tampered or expired ones", () => {
    const value = createSessionValue();
    expect(verifySessionValue(value)).toBe(true);
    expect(verifySessionValue(value.replace("admin.", "admin.9"))).toBe(false);
    expect(verifySessionValue(`${value}x`)).toBe(false);
    expect(verifySessionValue(value, Date.now() + 8 * 86_400_000)).toBe(false);
    expect(verifySessionValue(undefined)).toBe(false);
  });

  it("invalidates sessions when the password changes", () => {
    const value = createSessionValue();
    process.env.ADMIN_PASSWORD = "new password";
    expect(verifySessionValue(value)).toBe(false);
  });
});

describe("settings", () => {
  it("defaults are valid and every admin field maps to a real setting", () => {
    expect(settingsSchema.safeParse(DEFAULT_SETTINGS).success).toBe(true);
    for (const field of SECTIONS.flatMap((s) => s.fields)) {
      expect(getPath(DEFAULT_SETTINGS, field.path), field.path).not.toBeUndefined();
    }
  });

  it("fills missing fields from defaults and rejects invalid stored data", () => {
    const merged = withDefaults({ agent: { name: "Jane Doe" } });
    expect(merged.agent.name).toBe("Jane Doe");
    expect(merged.agent.email).toBe(DEFAULT_SETTINGS.agent.email);
    expect(withDefaults({ theme: { brandColor: "red" } })).toEqual(DEFAULT_SETTINGS);
    expect(withDefaults(null)).toEqual(DEFAULT_SETTINGS);
  });

  it("round-trips list and paragraph fields through the form", () => {
    expect(parseField("lines", "English\r\n\n Punjabi \n")).toEqual(["English", "Punjabi"]);
    expect(parseField("paragraphs", "One\nstill one\n\n\nTwo")).toEqual(["One\nstill one", "Two"]);
    expect(formatField("paragraphs", ["A", "B"])).toBe("A\n\nB");
    const next = setPath(DEFAULT_SETTINGS, "agent.name", "X");
    expect(next.agent.name).toBe("X");
    expect(DEFAULT_SETTINGS.agent.name).toBe("Your Name");
  });
});
