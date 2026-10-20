import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { createPublicClient } from "@/lib/supabase/public";
import { COUNTRY_INFO, jobPath } from "@/lib/jobs-seo";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const page = (path: string, priority: number, changeFrequency: "daily" | "weekly" | "monthly" | "yearly", lastModified: Date = now) =>
    ({ url: `${SITE_URL}${path}`, lastModified, changeFrequency, priority });

  let jobs: MetadataRoute.Sitemap = [];
  try {
    const { data } = await createPublicClient().from("jobs").select("id,title,company,location,updated_at,created_at")
      .eq("is_active", true).order("created_at", { ascending: false }).limit(5000);
    jobs = (data ?? []).map((j) => page(jobPath(j), 0.7, "weekly", new Date(j.updated_at ?? j.created_at)));
  } catch { /* sitemap still serves the static pages */ }

  return [
    { ...page("/", 1, "daily"), alternates: { languages: { en: `${SITE_URL}/`, fr: `${SITE_URL}/fr`, ar: `${SITE_URL}/ar` } } },
    { ...page("/fr", 0.9, "daily"), alternates: { languages: { en: `${SITE_URL}/`, fr: `${SITE_URL}/fr`, ar: `${SITE_URL}/ar` } } },
    { ...page("/ar", 0.9, "daily"), alternates: { languages: { en: `${SITE_URL}/`, fr: `${SITE_URL}/fr`, ar: `${SITE_URL}/ar` } } },
    page("/jobs", 0.9, "daily"),
    ...Object.values(COUNTRY_INFO).map((c) => page(`/jobs/country/${c.slug}`, 0.8, "daily")),
    page("/cv/builder", 0.9, "weekly", new Date("2026-10-14")),
    page("/about", 0.5, "monthly", new Date("2026-10-14")),
    page("/contact", 0.4, "yearly", new Date("2026-10-14")),
    page("/privacy", 0.3, "yearly", new Date("2026-10-14")),
    page("/terms", 0.3, "yearly", new Date("2026-10-14")),
    page("/cookies", 0.2, "yearly", new Date("2026-10-14")),
    page("/legal", 0.2, "yearly", new Date("2026-10-14")),
    ...jobs,
  ];
}
