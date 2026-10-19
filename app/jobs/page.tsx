import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "../_components/LegalShell";
import { JobList, CountryNav, Pagination, PAGE_SIZE, pageFrom } from "./_components/JobList";
import { createPublicClient } from "@/lib/supabase/public";
import { JOB_COLUMNS, type JobRow } from "@/lib/jobs-seo";
import { dedupeJobs } from "../_lib/country";

type SP = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({ searchParams }: { searchParams: SP }): Promise<Metadata> {
  const page = pageFrom(await searchParams);
  const title = `Latest jobs in Morocco, Europe & Saudi Arabia${page > 1 ? ` — page ${page}` : ""} | opportunty`;
  const description = "Browse the latest job offers in Morocco, France, Germany, Belgium, the Netherlands and Saudi Arabia, and tailor your CV to any of them with AI.";
  const url = page > 1 ? `/jobs?page=${page}` : "/jobs";
  return { title, description, alternates: { canonical: url }, openGraph: { type: "website", url, title, description } };
}

export default async function JobsPage({ searchParams }: { searchParams: SP }) {
  const page = pageFrom(await searchParams);
  const from = (page - 1) * PAGE_SIZE;
  const { data, count } = await createPublicClient().from("jobs").select(JOB_COLUMNS, { count: "estimated" })
    .eq("is_active", true).order("created_at", { ascending: false }).range(from, from + PAGE_SIZE - 1);
  return (
    <PageShell>
      <h1 style={{ fontSize: "clamp(28px, 4vw, 38px)", fontWeight: 600, margin: "0 0 10px", lineHeight: 1.15 }}>Latest job offers</h1>
      <p style={{ fontSize: 16, color: "#605d52", lineHeight: 1.6, margin: "0 0 12px" }}>Open roles in Morocco, Europe and Saudi Arabia, updated daily. Pick a job, then tailor your CV to it with AI — free to edit, pay only to download.</p>
      <p style={{ margin: "0 0 20px" }}>
        <Link href="/cv/builder" style={{ color: "#ff4f00", fontWeight: 700, textDecoration: "none" }}>No CV yet? Build one for free →</Link>
      </p>
      <CountryNav />
      <JobList jobs={dedupeJobs((data ?? []) as JobRow[])} />
      <Pagination base="/jobs" page={page} total={count ?? 0} />
    </PageShell>
  );
}
