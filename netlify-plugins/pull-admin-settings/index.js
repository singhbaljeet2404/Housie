// The Next.js build prerenders pages with the admin settings, but the build
// command can't read Netlify Blobs (build plugins can). Copy the saved settings
// to .data/ where src/lib/storage.ts's file fallback picks them up at build time.
import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { getStore } from "@netlify/blobs";

export const onPreBuild = async ({ utils }) => {
  const dataDir = join(process.cwd(), ".data");
  try {
    const store = getStore({ name: "housie-settings", consistency: "strong" });
    // get() of a missing key can hang; check with getMetadata() first (see src/lib/storage.ts).
    const settings = (await store.getMetadata("site")) ? await store.get("site", { type: "json" }) : null;
    // Never build with stale local files (e.g. from a CLI upload of a dev checkout).
    await rm(dataDir, { recursive: true, force: true });
    if (settings) {
      await mkdir(join(dataDir, "settings"), { recursive: true });
      await writeFile(join(dataDir, "settings", "site"), JSON.stringify(settings));
      console.log("pull-admin-settings: using saved admin settings");
    } else {
      console.log("pull-admin-settings: no saved settings yet, building with defaults");
    }
  } catch (error) {
    utils.build.failBuild("pull-admin-settings: could not read admin settings from Netlify Blobs", { error });
  }
};
