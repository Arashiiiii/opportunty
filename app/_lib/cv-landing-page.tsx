import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "../_components/LegalShell";
import { LangProvider } from "./useUiLang";
import { LOCALE_GROUPS, hreflang } from "./locale-routes";
import { CV_LANDING, TEMPLATE_IMAGES } from "@/lib/cv-landing";
import { SITE_URL } from "@/lib/site";
import type { Lang } from "../i18n";

const GROUP = LOCALE_GROUPS[1];
const HOME = LOCALE_GROUPS[0];
const ORANGE = "#ff4f00";

export function cvLandingMetadata(lang: Lang): Metadata {
  const c = CV_LANDING[lang];
  return {
    title: c.title,
    description: c.description,
    alternates: { canonical: GROUP[lang], languages: hreflang(GROUP) },
    openGraph: { type: "website", url: GROUP[lang], title: c.title, description: c.description, locale: c.ogLocale },
  };
}

export function CvLandingPage({ lang }: { lang: Lang }) {
  const c = CV_LANDING[lang];
  const btn: React.CSSProperties = { display: "inline-block", padding: "14px 22px", borderRadius: 12, fontSize: 16, fontWeight: 700, textDecoration: "none", textAlign: "center" };
  const h2: React.CSSProperties = { fontSize: 24, fontWeight: 600, margin: "44px 0 14px" };
  const p: React.CSSProperties = { fontSize: 15.5, lineHeight: 1.65, color: "#36342e", margin: 0 };
  const faqLd = {
    "@context": "https://schema.org", "@type": "FAQPage", inLanguage: lang,
    mainEntity: c.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  const appLd = {
    "@context": "https://schema.org", "@type": "WebApplication", name: "opportunty CV builder", url: `${SITE_URL}${GROUP[lang]}`,
    applicationCategory: "BusinessApplication", operatingSystem: "Any", inLanguage: lang, description: c.description,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };

  return (
    <LangProvider lang={lang}>
      <PageShell>
        <div lang={lang}>
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd).replace(/</g, "\\u003c") }} />
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(appLd).replace(/</g, "\\u003c") }} />

          <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", color: ORANGE, marginBottom: 8 }}>{c.eyebrow}</div>
          <h1 style={{ fontSize: "clamp(30px, 5vw, 44px)", fontWeight: 600, lineHeight: 1.1, margin: "0 0 14px" }}>{c.h1}</h1>
          <p style={{ ...p, fontSize: 17, color: "#605d52" }}>{c.sub}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, margin: "22px 0 10px" }}>
            <Link href="/cv/builder" style={{ ...btn, background: ORANGE, color: "#fffefb" }}>{c.ctaBuild}</Link>
            <Link href={HOME[lang]} style={{ ...btn, border: "1px solid rgba(32,21,21,0.24)", color: "#201515" }}>{c.ctaUpload}</Link>
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#166534" }}>✓ {c.free}</div>

          <h2 style={h2}>{c.stepsH}</h2>
          <ol style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
            {c.steps.map((s, i) => (
              <li key={s.h} style={{ padding: 18, borderRadius: 12, background: "#f8f4f0", border: "1px solid rgba(32,21,21,0.12)" }}>
                <div style={{ width: 28, height: 28, borderRadius: 9999, background: ORANGE, color: "#fffefb", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>{i + 1}</div>
                <h3 style={{ fontSize: 16.5, fontWeight: 700, margin: "0 0 6px" }}>{s.h}</h3>
                <p style={{ ...p, fontSize: 14.5 }}>{s.p}</p>
              </li>
            ))}
          </ol>

          <h2 style={h2}>{c.templatesH}</h2>
          <p style={{ ...p, marginBottom: 16 }}>{c.templatesP}</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(118px, 1fr))", gap: 12 }}>
            {TEMPLATE_IMAGES.map((t) => (
              <Link key={t} href="/cv/builder" style={{ display: "block", textDecoration: "none", color: "#201515" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/templates/${t}.png`} alt={`${t[0].toUpperCase()}${t.slice(1)} CV template`} loading="lazy" width={240} height={340}
                  style={{ width: "100%", height: "auto", aspectRatio: "240 / 340", objectFit: "cover", objectPosition: "top", borderRadius: 8, border: "1px solid rgba(32,21,21,0.12)", background: "#fff" }} />
                <div style={{ fontSize: 13, fontWeight: 600, marginTop: 6, textTransform: "capitalize" }}>{t}</div>
              </Link>
            ))}
          </div>

          <h2 style={h2}>{c.whyH}</h2>
          <ul style={{ margin: 0, paddingInlineStart: 22, display: "flex", flexDirection: "column", gap: 8 }}>
            {c.why.map((w) => <li key={w} style={p}>{w}</li>)}
          </ul>

          <h2 style={h2}>{c.pricingH}</h2>
          <p style={p}>{c.pricing}</p>

          <h2 style={h2}>{c.jobsH}</h2>
          <p style={{ ...p, marginBottom: 12 }}>{c.jobsP}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {c.countries.map((k) => (
              <Link key={k.slug} href={`/jobs/country/${k.slug}`} style={{ padding: "8px 14px", borderRadius: 9999, fontSize: 14, fontWeight: 600, textDecoration: "none", border: "1px solid rgba(32,21,21,0.15)", color: "#36342e", background: "#fff" }}>{k.label}</Link>
            ))}
          </div>

          <h2 style={h2}>{c.faqH}</h2>
          {c.faq.map((f) => (
            <div key={f.q} style={{ marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 4px" }}>{f.q}</h3>
              <p style={p}>{f.a}</p>
            </div>
          ))}

          <div style={{ marginTop: 36, padding: "22px 24px", borderRadius: 14, background: "#fff1e8", border: "1px solid #ffcbab", display: "flex", flexWrap: "wrap", gap: 14, alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{c.h1}</div>
            <Link href="/cv/builder" style={{ ...btn, background: ORANGE, color: "#fffefb" }}>{c.ctaBuild}</Link>
          </div>
        </div>
      </PageShell>
    </LangProvider>
  );
}
