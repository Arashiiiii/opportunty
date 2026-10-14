import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageShell } from "../../../_components/LegalShell";
import { JobList, CountryNav } from "../../_components/JobList";
import { createPublicClient } from "@/lib/supabase/public";
import { COUNTRY_BY_SLUG, COUNTRY_INFO, JOB_COLUMNS, countryOf, type JobRow } from "@/lib/jobs-seo";

export const revalidate = 1800;
export function generateStaticParams() { return Object.keys(COUNTRY_BY_SLUG).map((country) => ({ country })); }
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ country: string }> }): Promise<Metadata> {
  const code = COUNTRY_BY_SLUG[(await params).country];
  if (!code) return {};
  const c = COUNTRY_INFO[code];
  return {
    title: `Jobs in ${c.name} — latest job offers | opportunity.com`,
    description: `Browse the latest job offers in ${c.name}, then tailor your CV to any of them with AI. Free CV builder with ATS-friendly templates.`,
    alternates: { canonical: `/jobs/country/${c.slug}` },
  };
}

export default async function CountryJobs({ params }: { params: Promise<{ country: string }> }) {
  const slug = (await params).country;
  const code = COUNTRY_BY_SLUG[slug];
  if (!code) notFound();
  const c = COUNTRY_INFO[code];
  const { data } = await createPublicClient().from("jobs").select(JOB_COLUMNS).eq("is_active", true).order("created_at", { ascending: false }).limit(300);
  const jobs = ((data ?? []) as JobRow[]).filter((j) => countryOf(j) === code).slice(0, 100);
  return (
    <PageShell>
      <h1 style={{ fontSize: "clamp(28px, 4vw, 38px)", fontWeight: 600, margin: "0 0 10px", lineHeight: 1.15 }}>Jobs in {c.name}</h1>
      <p style={{ fontSize: 16, color: "#605d52", lineHeight: 1.6, margin: "0 0 20px" }}>
        {jobs.length} open {c.demonym} job offers, updated daily. Pick a job, then tailor your CV to it with AI — free to edit, in English, French and Arabic.
      </p>
      <CountryNav active={c.slug} />
      <JobList jobs={jobs} />
    </PageShell>
  );
}
