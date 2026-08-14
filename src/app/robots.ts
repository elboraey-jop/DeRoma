import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://deroma.store";

  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/api/catalog/", "/api/meta-catalog"],
      disallow: ["/admin/", "/api/", "/checkout/", "/profile/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
