import type { MetadataRoute } from "next";
import { siteUrl } from "@/config/site";
import { isSampleData } from "@/lib/listings";

export default function robots(): MetadataRoute.Robots {
  // Keep the sample-data preview out of search engines.
  if (isSampleData) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/l/"] },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
