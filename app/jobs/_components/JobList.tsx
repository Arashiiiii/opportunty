import Link from "next/link";
import { jobPath, countryOf, COUNTRY_INFO, type JobRow } from "@/lib/jobs-seo";

export function JobList({ jobs }: { jobs: JobRow[] }) {
  if (jobs.length === 0) return <p style={{ color: "#26343d", fontSize: 15 }}>No open jobs here right now — check back soon.</p>;
  return (
    <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
      {jobs.map((j) => (
        <li key={j.id}>
          <Link href={jobPath(j)} style={{ display: "block", padding: "16px 18px", border: "1px solid rgba(14,26,33,0.12)", borderRadius: 12, background: "#f3f2ed", textDecoration: "none", color: "#0e1a21" }}>
            <div dir="auto" style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.3 }}>{j.title}</div>
            <div dir="auto" style={{ fontSize: 14, color: "#26343d", marginTop: 4 }}>{j.company}{j.location ? ` · ${j.location}` : ""} · {COUNTRY_INFO[countryOf(j)].name}</div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function CountryNav({ active }: { active?: string }) {
  return (
    <nav aria-label="Jobs by country" style={{ display: "flex", flexWrap: "wrap", gap: 8, margin: "0 0 24px" }}>
      <Link href="/jobs" style={chip(!active)}>All</Link>
      {Object.values(COUNTRY_INFO).map((c) => <Link key={c.slug} href={`/jobs/country/${c.slug}`} style={chip(active === c.slug)}>{c.name}</Link>)}
    </nav>
  );
}
const chip = (on: boolean): React.CSSProperties => ({ padding: "7px 14px", borderRadius: 9999, fontSize: 14, fontWeight: 600, textDecoration: "none", border: "1px solid rgba(14,26,33,0.15)", background: on ? "#0e1a21" : "#fff", color: on ? "#ffffff" : "#26343d" });
