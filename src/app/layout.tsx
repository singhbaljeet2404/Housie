import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { Inter } from "next/font/google";
import "maplibre-gl/dist/maplibre-gl.css";
import "./globals.css";
import { siteUrl } from "@/config/site";
import { getSettings } from "@/lib/settings";
import { isSampleData } from "@/lib/listings";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const { agent, brokerage, seo } = await getSettings();
  return {
    metadataBase: new URL(siteUrl),
    applicationName: seo.siteName,
    title: {
      default: `${seo.defaultTitle} | ${agent.name}, ${brokerage.name}`,
      template: `%s | ${agent.name}`,
    },
    description: seo.description,
    // Keep the sample-data preview out of search engines.
    robots: isSampleData ? { index: false, follow: false } : undefined,
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const { theme } = await getSettings();
  return (
    <html
      lang="en-CA"
      className={`${inter.variable} h-full antialiased`}
      style={{ "--brand": theme.brandColor, "--accent": theme.accentColor } as CSSProperties}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
