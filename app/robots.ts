import type { MetadataRoute } from "next";
import { hasProductionUrl, siteConfig } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/offline"] },
    ...(hasProductionUrl ? { sitemap: `${siteConfig.url}/sitemap.xml` } : {})
  };
}
