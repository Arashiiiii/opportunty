import Link from "next/link";
import { PageShell } from "./LegalShell";
import { LangProvider } from "../_lib/useUiLang";
import { jobPath, type JobRow } from "@/lib/jobs-seo";
import { SITE_URL } from "@/lib/site";

export const frH1: React.CSSProperties = { fontSize: "clamp(28px, 4.5vw, 38px)", fontWeight: 700, margin: "0 0 14px", lineHeight: 1.15 };
export const frH2: React.CSSProperties = { fontSize: 24, fontWeight: 600, margin: "40px 0 12px" };
export const frH3: React.CSSProperties = { fontSize: 18, fontWeight: 700, margin: "24px 0 8px" };
export const frP: React.CSSProperties = { fontSize: 16, lineHeight: 1.7, color: "#26343d", margin: "0 0 12px" };
export const frUl: React.CSSProperties = { margin: "0 0 12px", paddingInlineStart: 22, display: "flex", flexDirection: "column", gap: 8 };
export const frBtn: React.CSSProperties = { display: "inline-block", padding: "13px 22px", borderRadius: 10, fontSize: 15, fontWeight: 700, textDecoration: "none", background: "#0079a8", color: "#fff" };
export const frLink: React.CSSProperties = { color: "#0079a8", fontWeight: 600 };

export function FrPage({ crumbs, children }: { crumbs: { name: string; href?: string }[]; children: React.ReactNode }) {
  const ld = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [{ name: "opportunty", href: "/fr" }, ...crumbs].map((c, i) => ({
      "@type": "ListItem", position: i + 1, name: c.name, ...(c.href ? { item: `${SITE_URL}${c.href}` } : {}),
    })),
  };
  return (
    <LangProvider lang="fr">
      <PageShell>
        <nav aria-label="Fil d'Ariane" style={{ fontSize: 13, color: "#5f7280", marginBottom: 16 }}>
          <Link href="/fr" style={{ color: "inherit" }}>Accueil</Link>
          {crumbs.map((c) => <span key={c.name}> › {c.href ? <Link href={c.href} style={{ color: "inherit" }}>{c.name}</Link> : c.name}</span>)}
        </nav>
        <article lang="fr">{children}</article>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      </PageShell>
    </LangProvider>
  );
}

export function FrJobs({ jobs, empty }: { jobs: JobRow[]; empty: string }) {
  if (jobs.length === 0) return <p style={frP}>{empty}</p>;
  return (
    <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
      {jobs.map((j) => (
        <li key={j.id}>
          <Link href={jobPath(j)} style={{ display: "block", padding: "14px 16px", border: "1px solid rgba(14,26,33,0.12)", borderRadius: 12, background: "#f3f2ed", textDecoration: "none", color: "#0e1a21" }}>
            <div dir="auto" style={{ fontSize: 16.5, fontWeight: 700, lineHeight: 1.3 }}>{j.title}</div>
            <div dir="auto" style={{ fontSize: 14, color: "#26343d", marginTop: 3 }}>{j.company}{j.location ? ` · ${j.location}` : ""}</div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
