import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { cache } from "react";
import { PageShell } from "../../_components/LegalShell";
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
  const { data: recent } = await createPublicClient().from("jobs").select(JOB_COLUMNS).eq("is_active", true).neq("id", job.id).order("created_at", { ascending: false }).limit(150);
  const related = ((recent ?? []) as JobRow[]).filter((r) => countryOf(r) === countryOf(job)).slice(0, 6);
  const ld = jobPostingJsonLd(job, absolute(path));
  const btn: React.CSSProperties = { display: "inline-block", padding: "12px 20px", borderRadius: 10, fontSize: 15, fontWeight: 700, textDecoration: "none" };

  return (
    <PageShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />
      <nav aria-label="Breadcrumb" style={{ fontSize: 13, color: "#5f7280", marginBottom: 14 }}>
        <Link href="/jobs" style={{ color: "inherit" }}>Jobs</Link> › <Link href={`/jobs/country/${country.slug}`} style={{ color: "inherit" }}>{country.name}</Link>
      </nav>
      <h1 dir="auto" style={{ fontSize: "clamp(26px, 4vw, 34px)", fontWeight: 600, margin: "0 0 8px", lineHeight: 1.2 }}>{job.title}</h1>
      <p dir="auto" style={{ fontSize: 17, color: "#26343d", margin: "0 0 6px", fontWeight: 600 }}>{job.company}</p>
      <p dir="auto" style={{ fontSize: 14.5, color: "#26343d", margin: "0 0 18px" }}>
        {[job.location, country.name, job.job_type, job.salary_range].filter(Boolean).join(" · ")}
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, margin: "0 0 28px" }}>
        {apply && <a href={apply} target="_blank" rel="nofollow noopener noreferrer" style={{ ...btn, background: "#0079a8", color: "#ffffff" }}>Apply on the employer site ↗</a>}
        <Link href="/cv/builder" style={{ ...btn, border: "1px solid rgba(14,26,33,0.24)", color: "#0e1a21" }}>Tailor my CV with AI</Link>
      </div>
      {(job.tags ?? []).length > 0 && (
        <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", display: "flex", flexWrap: "wrap", gap: 8 }}>
          {job.tags!.map((t) => <li key={t} style={{ fontSize: 13, padding: "4px 11px", borderRadius: 9999, border: "1px solid rgba(14,26,33,0.15)", color: "#26343d" }}>{t}</li>)}
        </ul>
      )}
      <section aria-label="Job description" dir="auto">
        {paras.map((p, i) => <p key={i} style={{ fontSize: 15, lineHeight: 1.7, color: "#26343d", margin: "0 0 12px", whiteSpace: "pre-line" }}>{p}</p>)}
      </section>
      <section aria-labelledby="apply-h" style={{ marginTop: 36, paddingTop: 24, borderTop: "1px solid rgba(14,26,33,0.12)" }}>
        <h2 id="apply-h" style={{ fontSize: 20, fontWeight: 600, margin: "0 0 10px" }}>Applying for this {country.name} role</h2>
        <p style={{ fontSize: 15, lineHeight: 1.7, color: "#26343d", margin: "0 0 10px" }}>
          Recruiters in {country.name} often screen applications with software before a person reads them. Read the offer above, note the skills and tools it repeats, and make sure your CV uses the same words where they are true for you.
        </p>
        <p style={{ fontSize: 15, lineHeight: 1.7, color: "#26343d", margin: 0 }}>
          <Link href="/cv/builder" style={{ color: "#0079a8", fontWeight: 700 }}>Tailor your CV to “{job.title}” with AI</Link> — free to edit, no account needed until you download. See also our <Link href={`/jobs/country/${country.slug}`} style={{ color: "#0079a8", fontWeight: 700 }}>guide to finding a job in {country.name}</Link>.
        </p>
      </section>
      {related.length > 0 && (
        <section aria-labelledby="rel-h" style={{ marginTop: 32 }}>
          <h2 id="rel-h" style={{ fontSize: 20, fontWeight: 600, margin: "0 0 12px" }}>More jobs in {country.name}</h2>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
            {related.map((r) => (
              <li key={r.id}><Link href={jobPath(r)} dir="auto" style={{ color: "#0e1a21", textDecoration: "none", fontSize: 15 }}><b>{r.title}</b> · {r.company}{r.location ? ` · ${r.location}` : ""}</Link></li>
            ))}
          </ul>
        </section>
      )}
      <p style={{ fontSize: 12.5, color: "#5f7280", marginTop: 28 }}>Job listing collected from a public source. opportunty.com is not the employer — always verify the offer before sharing personal information.</p>
    </PageShell>
  );
}
