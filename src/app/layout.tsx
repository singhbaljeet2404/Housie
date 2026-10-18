import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "maplibre-gl/dist/maplibre-gl.css";
import "./globals.css";
import { site } from "@/config/site";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `GTA Homes for Sale | ${site.agent.name}, ${site.brokerage.name}`,
    template: `%s | ${site.agent.name}`,
  },
  description: `Search MLS® listings across Brampton, Mississauga, Toronto and the GTA with ${site.agent.name}, ${site.agent.title} at ${site.brokerage.name}.`,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-CA" className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <Header />
        <main className="flex flex-1 flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
