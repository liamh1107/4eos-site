import type { MetadataRoute } from "next";
import { industries, services } from "@/lib/content";
import { getPosts } from "@/lib/posts";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/services",
    "/secureai",
    "/industries",
    "/why-4eos",
    "/about",
    "/faq",
    "/support",
    "/contact",
    "/blog",
    "/privacy",
    "/terms",
    "/accessibility",
  ];

  const now = new Date();

  return [
    ...staticRoutes.map((path) => ({
      url: path ? `${site.url}${path}` : site.url,
      lastModified: now,
    })),
    ...services.map((s) => ({
      url: `${site.url}/services/${s.slug}`,
      lastModified: now,
    })),
    ...industries.map((i) => ({
      url: `${site.url}/industries/${i.slug}`,
      lastModified: now,
    })),
    ...getPosts().map((p) => ({
      url: `${site.url}/blog/${p.slug}`,
      lastModified: new Date(p.date),
    })),
  ];
}
