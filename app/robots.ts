import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://mainstreetmetrics.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        disallow: ["/dashboard", "/dashboard/", "/api/", "/login", "/signup"],
      },
    ],
    host: siteUrl,
  };
}
