import type { Metadata } from "next";
import HomeClient, { type Job } from "../HomeClient";
import { LangProvider } from "./useUiLang";
import { dedupeJobs } from "./country";
import { createPublicClient } from "@/lib/supabase/public";
import { HOME_META } from "@/lib/site";
import { LOCALE_GROUPS, hreflang } from "./locale-routes";
import type { Lang } from "../i18n";

const HOME_GROUP = LOCALE_GROUPS[0];
const COLS = "id, title, company, location, job_type, salary_range, tags, description, logo_url, external_url, original_url, created_at";

/** Real Moroccan listings rendered on the server, so visitors and crawlers see live jobs before any JavaScript runs. */
async function initialJobs(): Promise<Job[]> {
  try {
    const { data } = await createPublicClient().from("jobs").select(COLS)
      .eq("is_active", true).eq("Country", "MA").order("created_at", { ascending: false }).limit(60);
    return dedupeJobs(((data ?? []) as Job[]).map((j) => ({ ...j, tags: j.tags ?? [] })));
  } catch {
    return [];
  }
}

export function homeMetadata(lang: Lang): Metadata {
  const m = HOME_META[lang];
  return {
    title: m.title,
    description: m.description,
    alternates: { canonical: HOME_GROUP[lang], languages: hreflang(HOME_GROUP) },
    openGraph: { type: "website", url: HOME_GROUP[lang], title: m.title, description: m.description, locale: m.ogLocale },
  };
}

export async function HomePage({ lang }: { lang: Lang | null }) {
  const jobs = await initialJobs();
  const page = <HomeClient initialJobs={jobs} />;
  return lang ? <LangProvider lang={lang}>{page}</LangProvider> : page;
}
