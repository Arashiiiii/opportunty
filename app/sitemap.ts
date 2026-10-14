import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

const LAST = new Date("2026-10-14");

export default function sitemap(): MetadataRoute.Sitemap {
  const page = (path: string, priority: number, changeFrequency: "daily" | "weekly" | "monthly" | "yearly") =>
    ({ url: `${SITE_URL}${path}`, lastModified: LAST, changeFrequency, priority });
  return [
    page("/", 1, "daily"),
    page("/cv/builder", 0.9, "weekly"),
    page("/about", 0.5, "monthly"),
    page("/contact", 0.4, "yearly"),
    page("/privacy", 0.3, "yearly"),
    page("/terms", 0.3, "yearly"),
    page("/cookies", 0.2, "yearly"),
    page("/legal", 0.2, "yearly"),
  ];
}
