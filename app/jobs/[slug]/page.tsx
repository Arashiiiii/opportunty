import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { cache } from "react";
import { PageShell } from "../../_components/LegalShell";
import { tailorHref } from "../_components/JobList";
import { createPublicClient } from "@/lib/supabase/public";
import { COUNTRY_INFO, JOB_COLUMNS, absolute, countryOf, descriptionParagraphs, idFromSlug, jobPath, jobPostingJsonLd, metaDescription, type JobRow } from "@/lib/jobs-seo";

export const revalidate = 1800;

// Inactive jobs are hidden by RLS → null → 404, which tells Google the job is gone.
const getJob = cache(async (id: string): Promise<JobRow | null> => {
  const { data } = await createPublicClient().from("jobs").select(JOB_COLUMNS).eq("id", id).eq("is_active", true).maybeSingle();
  return (data as JobRow | null) ?? null;
});

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const id = idFromSlug((await params).slug);
  const job = id ? await getJob(id) : null;
  if (!job) return { title: "Job not found — opportunty.com", robots: { index: false } };
  const title = `${job.title} — ${job.company}${job.location ? `, ${job.location}` : ""} | opportunty.com`;
  return {
    title, description: metaDescription(job), alternates: { canonical: jobPath(job) },
    openGraph: { type: "article", title, description: metaDescription(job), url: jobPath(job) },
    twitter: { card: "summary_large_image", title, description: metaDescription(job) },
  };
}

export default async function JobPage({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  const id = idFromSlug(slug);
  const job = id ? await getJob(id) : null;
  if (!job) notFound();
  const path = jobPath(job);
  if (decodeURIComponent(slug) !== path.replace("/jobs/", "")) permanentRedirect(path);

  const country = COUNTRY_INFO[countryOf(job)];
  const apply = job.original_url || job.external_url;
  const paras = descriptionParagraphs(job.description);
  const ld = jobPostingJsonLd(job, absolute(path));
  const btn: React.CSSProperties = { display: "inline-block", padding: "12px 20px", borderRadius: 10, fontSize: 15, fontWeight: 700, textDecoration: "none" };

  return (
    <PageShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />
      <nav aria-label="Breadcrumb" style={{ fontSize: 13, color: "#939084", marginBottom: 14 }}>
        <Link href="/jobs" style={{ color: "inherit" }}>Jobs</Link> › <Link href={`/jobs/country/${country.slug}`} style={{ color: "inherit" }}>{country.name}</Link>
      </nav>
      <h1 dir="auto" style={{ fontSize: "clamp(26px, 4vw, 34px)", fontWeight: 600, margin: "0 0 8px", lineHeight: 1.2 }}>{job.title}</h1>
      <p dir="auto" style={{ fontSize: 17, color: "#36342e", margin: "0 0 6px", fontWeight: 600 }}>{job.company}</p>
      <p dir="auto" style={{ fontSize: 14.5, color: "#605d52", margin: "0 0 18px" }}>
        {[job.location, country.name, job.job_type, job.salary_range].filter(Boolean).join(" · ")}
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, margin: "0 0 28px" }}>
        {/* Tailoring is the main action: it carries this job into the CV flow (upload or reuse a CV, then AI tailors it). */}
        <Link href={tailorHref(job.id)} rel="nofollow" style={{ ...btn, background: "#ff4f00", color: "#fffefb" }}>Tailor my CV to this job — free</Link>
        {apply && <a href={apply} target="_blank" rel="nofollow noopener noreferrer" style={{ ...btn, border: "1px solid rgba(32,21,21,0.24)", color: "#201515" }}>Apply on the employer site ↗</a>}
      </div>
      {(job.tags ?? []).length > 0 && (
        <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", display: "flex", flexWrap: "wrap", gap: 8 }}>
          {job.tags!.map((t) => <li key={t} style={{ fontSize: 13, padding: "4px 11px", borderRadius: 9999, border: "1px solid rgba(32,21,21,0.15)", color: "#36342e" }}>{t}</li>)}
        </ul>
      )}
      <section aria-label="Job description" dir="auto">
        {paras.map((p, i) => <p key={i} style={{ fontSize: 15, lineHeight: 1.7, color: "#36342e", margin: "0 0 12px", whiteSpace: "pre-line" }}>{p}</p>)}
      </section>
      <aside style={{ marginTop: 32, padding: "20px 22px", borderRadius: 14, background: "#fff1e8", border: "1px solid #ffcbab" }}>
        <div style={{ fontSize: 18, fontWeight: 700, margin: "0 0 6px" }}>Get your CV ready for this job</div>
        <p style={{ fontSize: 15, lineHeight: 1.6, color: "#36342e", margin: "0 0 14px" }}>
          Upload your CV (PDF or Word) and AI rewrites your title, summary and skills to match {job.company}&apos;s offer. Free to edit — pay only when you download.
        </p>
        <Link href={tailorHref(job.id)} rel="nofollow" style={{ ...btn, background: "#ff4f00", color: "#fffefb" }}>Tailor my CV →</Link>
      </aside>
      <p style={{ fontSize: 12.5, color: "#939084", marginTop: 28 }}>Job listing collected from a public source. opportunty.com is not the employer — always verify the offer before sharing personal information.</p>
    </PageShell>
  );
}
