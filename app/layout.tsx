import type { Metadata } from "next";
import "./globals.css";
import { getPublicSiteUrl } from "@/lib/site-url";
import { Manrope, Instrument_Serif } from "next/font/google";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });
const instrumentSerif = Instrument_Serif({ subsets: ["latin"], variable: "--font-instrument", weight: "400", style: ["normal", "italic"], display: "swap" });

const siteUrl = getPublicSiteUrl();
const title = "Lordic | Obadasa Kayode, Full-Stack Developer";
const description = "Lordic is the product studio of Obadasa Kayode, a full-stack developer building SaaS MVPs, web products and applied AI from product definition through launch.";
const logoImageUrl = siteUrl ? new URL("/lordic-logo.png", siteUrl).toString() : undefined;

export const metadata: Metadata = {
  metadataBase: siteUrl ? new URL(siteUrl) : undefined,
  title: { default: title, template: "%s | Lordic" },
  description,
  keywords: ["Lordic", "Obadasa Kayode", "full-stack development", "SaaS MVPs", "web application development", "AI products"],
  alternates: siteUrl ? { canonical: "/" } : undefined,
  openGraph: {
    type: "website",
    siteName: "Lordic",
    title,
    description,
    url: siteUrl ?? undefined,
    images: logoImageUrl ? [{ url: logoImageUrl, width: 1774, height: 887, alt: "Lordic logo" }] : undefined,
  },
  twitter: {
    card: logoImageUrl ? "summary_large_image" : "summary",
    title,
    description,
    images: logoImageUrl ? [logoImageUrl] : undefined,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${instrumentSerif.variable}`}>
        <a className="skip-link" href="#main">Skip to content</a>
        {children}
      </body>
    </html>
  );
}
