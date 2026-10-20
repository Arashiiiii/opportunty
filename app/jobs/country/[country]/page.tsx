import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageShell } from "../../../_components/LegalShell";
import { JobList, CountryNav } from "../../_components/JobList";
import { createPublicClient } from "@/lib/supabase/public";
import Link from "next/link";
import { GUIDES } from "@/lib/country-guides";
import { COUNTRY_BY_SLUG, COUNTRY_INFO, JOB_COLUMNS, countryOf, type JobRow } from "@/lib/jobs-seo";

export const revalidate = 1800;
export function generateStaticParams() { return Object.keys(COUNTRY_BY_SLUG).map((country) => ({ country })); }
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ country: string }> }): Promise<Metadata> {
  const code = COUNTRY_BY_SLUG[(await params).country];
  if (!code) return {};
  const c = COUNTRY_INFO[code];
  return {
    title: `Jobs in ${c.name} — latest job offers | opportunty.com`,
    description: `Browse the latest job offers in ${c.name}, then tailor your CV to any of them with AI. Free CV builder with ATS-friendly templates.`,
    alternates: { canonical: `/jobs/country/${c.slug}` },
  };
}

export default async function CountryJobs({ params }: { params: Promise<{ country: string }> }) {
  const slug = (await params).country;
  const code = COUNTRY_BY_SLUG[slug];
  if (!code) notFound();
  const c = COUNTRY_INFO[code];
  const guide = GUIDES[code];
  const { data } = await createPublicClient().from("jobs").select(JOB_COLUMNS).eq("is_active", true).order("created_at", { ascending: false }).limit(300);
  const jobs = ((data ?? []) as JobRow[]).filter((j) => countryOf(j) === code).slice(0, 100);
  return (
    <PageShell>
      <h1 style={{ fontSize: "clamp(28px, 4vw, 38px)", fontWeight: 600, margin: "0 0 10px", lineHeight: 1.15 }}>Jobs in {c.name}</h1>
      <p style={{ fontSize: 16, color: "#26343d", lineHeight: 1.6, margin: "0 0 20px" }}>
        {jobs.length} open {c.demonym} job offers, updated daily. Pick a job, then tailor your CV to it with AI — free to edit, in English, French and Arabic.
      </p>
      <CountryNav active={c.slug} />
      <JobList jobs={jobs} />

      <section aria-labelledby="guide-h" style={{ marginTop: 48, paddingTop: 32, borderTop: "1px solid rgba(14,26,33,0.12)" }}>
        <h2 id="guide-h" style={{ fontSize: 24, fontWeight: 600, margin: "0 0 12px" }}>Finding a job in {c.name}</h2>
        {guide.intro.map((p, i) => <p key={i} style={{ fontSize: 15.5, lineHeight: 1.7, color: "#26343d", margin: "0 0 12px" }}>{p}</p>)}

        <h3 style={{ fontSize: 18, fontWeight: 700, margin: "28px 0 10px" }}>CV tips for {c.name}</h3>
        <ul style={{ margin: 0, paddingInlineStart: 22, listStyle: "disc", display: "flex", flexDirection: "column", gap: 8 }}>
          {guide.cvTips.map((t) => <li key={t} style={{ fontSize: 15, lineHeight: 1.6, color: "#26343d" }}>{t}</li>)}
        </ul>
        <p style={{ margin: "16px 0 0" }}>
          <Link href="/cv/builder" style={{ color: "#0079a8", fontWeight: 700, textDecoration: "none" }}>Build your CV for {c.name} with AI →</Link>
        </p>

        <h3 style={{ fontSize: 18, fontWeight: 700, margin: "28px 0 10px" }}>Official resources</h3>
        <ul style={{ margin: 0, paddingInlineStart: 22, listStyle: "disc", display: "flex", flexDirection: "column", gap: 8 }}>
          {guide.agencies.map((a) => <li key={a.name} style={{ fontSize: 15, lineHeight: 1.6, color: "#26343d" }}><b>{a.name}</b> — {a.note}</li>)}
        </ul>

        <h3 style={{ fontSize: 18, fontWeight: 700, margin: "28px 0 10px" }}>Frequently asked questions</h3>
        {guide.faq.map((f) => (
          <div key={f.q} style={{ marginBottom: 14 }}>
            <h4 style={{ fontSize: 15.5, fontWeight: 700, margin: "0 0 4px" }}>{f.q}</h4>
            <p style={{ fontSize: 15, lineHeight: 1.65, color: "#26343d", margin: 0 }}>{f.a}</p>
          </div>
        ))}
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org", "@type": "FAQPage",
        mainEntity: guide.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      }).replace(/</g, "\\u003c") }} />
    </PageShell>
  );
}
