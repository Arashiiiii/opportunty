import Link from "next/link";
import { PageShell } from "./LegalShell";
import { LangProvider } from "../_lib/useUiLang";
import { CV_COPY } from "@/lib/cv-landing";
import type { SeoLang } from "@/lib/site-i18n";

const btn: React.CSSProperties = { display: "inline-block", padding: "13px 22px", borderRadius: 10, fontSize: 15, fontWeight: 700, textDecoration: "none" };
const h2: React.CSSProperties = { fontSize: 24, fontWeight: 600, margin: "40px 0 12px" };
const p: React.CSSProperties = { fontSize: 16, lineHeight: 1.7, color: "#26343d", margin: "0 0 12px" };

export function CvLanding({ lang }: { lang: SeoLang }) {
  const c = CV_COPY[lang];
  const jobs = "/jobs";
  return (
    <LangProvider lang={lang}>
      <PageShell>
        <article>
          <h1 style={{ fontSize: "clamp(30px, 5vw, 42px)", fontWeight: 700, margin: "0 0 14px", lineHeight: 1.15 }}>{c.h1}</h1>
          <p style={{ ...p, fontSize: 18 }}>{c.intro}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, margin: "20px 0 0" }}>
            <Link href="/cv/builder" style={{ ...btn, background: "#0079a8", color: "#fff" }}>{c.cta}</Link>
            <Link href={jobs} style={{ ...btn, border: "1px solid rgba(14,26,33,0.24)", color: "#0e1a21" }}>{c.jobsCta}</Link>
          </div>

          <h2 style={h2}>{c.stepsH}</h2>
          <ol style={{ margin: 0, paddingInlineStart: 22, display: "flex", flexDirection: "column", gap: 12 }}>
            {c.steps.map((s) => <li key={s.t} style={p}><b>{s.t}.</b> {s.d}</li>)}
          </ol>

          <h2 style={h2}>{c.whyH}</h2>
          {c.why.map((t) => <p key={t} style={p}>{t}</p>)}

          <h2 style={h2}>{c.tplH}</h2>
          <p style={p}>{c.tpl}</p>

          <h2 style={h2}>{c.faqH}</h2>
          {c.faq.map((f) => (
            <div key={f.q} style={{ marginBottom: 16 }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 4px" }}>{f.q}</h3>
              <p style={{ ...p, margin: 0 }}>{f.a}</p>
            </div>
          ))}

          <h2 style={h2}>{c.jobsH}</h2>
          <p style={p}>{c.jobsP}</p>
          <ul style={{ margin: "0 0 24px", paddingInlineStart: 22, display: "flex", flexDirection: "column", gap: 6 }}>
            {[["Morocco", "morocco"], ["France", "france"], ["Germany", "germany"], ["Belgium", "belgium"], ["Netherlands", "netherlands"], ["Saudi Arabia", "saudi-arabia"]].map(([n, s]) => (
              <li key={s} style={p}><Link href={`/jobs/country/${s}`} style={{ color: "#0079a8", fontWeight: 600 }}>{n}</Link></li>
            ))}
          </ul>
          <Link href="/cv/builder" style={{ ...btn, background: "#0079a8", color: "#fff" }}>{c.cta}</Link>
        </article>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org", "@type": "FAQPage",
          mainEntity: c.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
        }).replace(/</g, "\\u003c") }} />
      </PageShell>
    </LangProvider>
  );
}
