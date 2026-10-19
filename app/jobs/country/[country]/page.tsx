import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageShell } from "../../../_components/LegalShell";
import { JobList, CountryNav, Pagination, PAGE_SIZE, pageFrom } from "../../_components/JobList";
import { dedupeJobs } from "../../../_lib/country";
import { createPublicClient } from "@/lib/supabase/public";
import Link from "next/link";
import { GUIDES } from "@/lib/country-guides";
import { COUNTRY_BY_SLUG, COUNTRY_INFO, JOB_COLUMNS, type JobRow } from "@/lib/jobs-seo";

type SP = Promise<Record<string, string | string[] | undefined>>;

export const revalidate = 1800;
export function generateStaticParams() { return Object.keys(COUNTRY_BY_SLUG).map((country) => ({ country })); }
export const dynamicParams = false;

export async function generateMetadata({ params, searchParams }: { params: Promise<{ country: string }>; searchParams: SP }): Promise<Metadata> {
  const code = COUNTRY_BY_SLUG[(await params).country];
  if (!code) return {};
  const c = COUNTRY_INFO[code];
  const page = pageFrom(await searchParams);
  const title = `Jobs in ${c.name}${page > 1 ? ` — page ${page}` : " — latest job offers"} | opportunty`;
  const description = `Browse the latest job offers in ${c.name}, then tailor your CV to any of them with AI. Free CV builder with ATS-friendly templates.`;
  const url = `/jobs/country/${c.slug}${page > 1 ? `?page=${page}` : ""}`;
  return { title, description, alternates: { canonical: url }, openGraph: { type: "website", url, title, description } };
}

export default async function CountryJobs({ params, searchParams }: { params: Promise<{ country: string }>; searchParams: SP }) {
  const slug = (await params).country;
  const code = COUNTRY_BY_SLUG[slug];
  if (!code) notFound();
  const c = COUNTRY_INFO[code];
  const guide = GUIDES[code];
  const page = pageFrom(await searchParams);
  const from = (page - 1) * PAGE_SIZE;
  const { data, count } = await createPublicClient().from("jobs").select(JOB_COLUMNS, { count: "exact" })
    .eq("is_active", true).eq("Country", code).order("created_at", { ascending: false }).range(from, from + PAGE_SIZE - 1);
  const jobs = dedupeJobs((data ?? []) as JobRow[]);
  return (
    <PageShell>
      <h1 style={{ fontSize: "clamp(28px, 4vw, 38px)", fontWeight: 600, margin: "0 0 10px", lineHeight: 1.15 }}>Jobs in {c.name}</h1>
      <p style={{ fontSize: 16, color: "#605d52", lineHeight: 1.6, margin: "0 0 20px" }}>
        {count ?? jobs.length} open {c.demonym} job offers, updated daily. Pick a job, then tailor your CV to it with AI — free to edit, in English, French and Arabic.
      </p>
      <CountryNav active={c.slug} />
      <JobList jobs={jobs} />
      <Pagination base={`/jobs/country/${c.slug}`} page={page} total={count ?? 0} />

      <section aria-labelledby="guide-h" style={{ marginTop: 48, paddingTop: 32, borderTop: "1px solid rgba(32,21,21,0.12)" }}>
        <h2 id="guide-h" style={{ fontSize: 24, fontWeight: 600, margin: "0 0 12px" }}>Finding a job in {c.name}</h2>
        {guide.intro.map((p, i) => <p key={i} style={{ fontSize: 15.5, lineHeight: 1.7, color: "#36342e", margin: "0 0 12px" }}>{p}</p>)}

        <h3 style={{ fontSize: 18, fontWeight: 700, margin: "28px 0 10px" }}>CV tips for {c.name}</h3>
        <ul style={{ margin: 0, paddingInlineStart: 22, listStyle: "disc", display: "flex", flexDirection: "column", gap: 8 }}>
          {guide.cvTips.map((t) => <li key={t} style={{ fontSize: 15, lineHeight: 1.6, color: "#36342e" }}>{t}</li>)}
        </ul>
        <p style={{ margin: "16px 0 0" }}>
          <Link href="/cv/builder" style={{ color: "#ff4f00", fontWeight: 700, textDecoration: "none" }}>Build your CV for {c.name} with AI →</Link>
        </p>

        <h3 style={{ fontSize: 18, fontWeight: 700, margin: "28px 0 10px" }}>Official resources</h3>
        <ul style={{ margin: 0, paddingInlineStart: 22, listStyle: "disc", display: "flex", flexDirection: "column", gap: 8 }}>
          {guide.agencies.map((a) => <li key={a.name} style={{ fontSize: 15, lineHeight: 1.6, color: "#36342e" }}><b>{a.name}</b> — {a.note}</li>)}
        </ul>

        <h3 style={{ fontSize: 18, fontWeight: 700, margin: "28px 0 10px" }}>Frequently asked questions</h3>
        {guide.faq.map((f) => (
          <div key={f.q} style={{ marginBottom: 14 }}>
            <h4 style={{ fontSize: 15.5, fontWeight: 700, margin: "0 0 4px" }}>{f.q}</h4>
            <p style={{ fontSize: 15, lineHeight: 1.65, color: "#36342e", margin: 0 }}>{f.a}</p>
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
