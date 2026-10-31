import { randomBytes } from "node:crypto";
import { deleteKey, getJSON, listKeys, setJSON } from "./storage";
import type { Lead } from "./leads";

export interface StoredLead extends Lead {
  id: string;
  receivedAt: string;
}

// Keys sort chronologically: <ISO timestamp>_<random>
export async function storeLead(lead: Lead): Promise<StoredLead> {
  const receivedAt = new Date().toISOString();
  const id = `${receivedAt.replace(/[:.]/g, "-")}_${randomBytes(4).toString("hex")}`;
  const stored = { ...lead, id, receivedAt };
  await setJSON("leads", id, stored);
  return stored;
}

export async function listLeads(): Promise<StoredLead[]> {
  const keys = (await listKeys("leads")).sort().reverse();
  const leads = await Promise.all(keys.map((k) => getJSON<StoredLead>("leads", k)));
  return leads.filter((l): l is StoredLead => l !== null);
}

export async function deleteLead(id: string) {
  if (!/^[0-9TZ-]+_[0-9a-f]{8}$/.test(id)) throw new Error("Invalid lead id");
  await deleteKey("leads", id);
}
