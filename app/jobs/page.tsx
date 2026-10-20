import type { Metadata } from "next";
import { PageShell } from "../_components/LegalShell";
import { JobList, CountryNav } from "./_components/JobList";
import { createPublicClient } from "@/lib/supabase/public";
import { JOB_COLUMNS, type JobRow } from "@/lib/jobs-seo";

export const revalidate = 1800;

export const metadata: Metadata = {
  title: "Latest jobs in Morocco, France, Germany, Belgium, Netherlands & Saudi Arabia | opportunty.com",
  description: "Browse the latest job offers in Morocco, France, Germany, Belgium, the Netherlands and Saudi Arabia, and tailor your CV to any of them with AI.",
  alternates: { canonical: "/jobs" },
};

export default async function JobsPage() {
  const { data } = await createPublicClient().from("jobs").select(JOB_COLUMNS).eq("is_active", true).order("created_at", { ascending: false }).limit(100);
  return (
    <PageShell>
      <h1 style={{ fontSize: "clamp(28px, 4vw, 38px)", fontWeight: 600, margin: "0 0 10px", lineHeight: 1.15 }}>Latest job offers</h1>
      <p style={{ fontSize: 16, color: "#605d52", lineHeight: 1.6, margin: "0 0 20px" }}>Open roles in Morocco, Europe and Saudi Arabia, updated daily. Pick a job, then tailor your CV to it with AI.</p>
      <CountryNav />
      <JobList jobs={(data ?? []) as JobRow[]} />
    </PageShell>
  );
}
