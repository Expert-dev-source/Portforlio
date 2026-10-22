import type { MetadataRoute } from "next";
import { getPublicSiteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getPublicSiteUrl();
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] },
    sitemap: siteUrl ? new URL("/sitemap.xml", siteUrl).toString() : undefined,
    host: siteUrl ?? undefined,
  };
}
