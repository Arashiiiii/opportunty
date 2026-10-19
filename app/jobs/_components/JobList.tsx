import Link from "next/link";
import { jobPath, countryOf, COUNTRY_INFO, type JobRow } from "@/lib/jobs-seo";

/** Where every "tailor my CV" button goes: the homepage picks the job up and starts tailoring. */
export const tailorHref = (id: string) => `/?tailor=${id}`;

export function JobList({ jobs }: { jobs: JobRow[] }) {
  if (jobs.length === 0) return <p style={{ color: "#605d52", fontSize: 15 }}>No open jobs here right now — check back soon.</p>;
  return (
    <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
      {jobs.map((j) => (
        <li key={j.id} style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, padding: "14px 16px", border: "1px solid rgba(32,21,21,0.12)", borderRadius: 12, background: "#f8f4f0" }}>
          <Link href={jobPath(j)} style={{ flex: "1 1 280px", minWidth: 0, textDecoration: "none", color: "#201515" }}>
            <div dir="auto" style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.3 }}>{j.title}</div>
            <div dir="auto" style={{ fontSize: 14, color: "#605d52", marginTop: 4 }}>{j.company}{j.location ? ` · ${j.location}` : ""} · {COUNTRY_INFO[countryOf(j)].name}</div>
          </Link>
          <Link href={tailorHref(j.id)} rel="nofollow" style={{ flex: "0 0 auto", fontSize: 13.5, fontWeight: 700, padding: "8px 14px", borderRadius: 9999, background: "#ff4f00", color: "#fffefb", textDecoration: "none", whiteSpace: "nowrap" }}>
            Tailor my CV →
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
const chip = (on: boolean): React.CSSProperties => ({ padding: "7px 14px", borderRadius: 9999, fontSize: 14, fontWeight: 600, textDecoration: "none", border: "1px solid rgba(32,21,21,0.15)", background: on ? "#201515" : "#fff", color: on ? "#fffefb" : "#36342e" });

export const PAGE_SIZE = 30;

/** Parse ?page=N (1-based, clamped). */
export function pageFrom(sp: Record<string, string | string[] | undefined>): number {
  const n = Number(Array.isArray(sp.page) ? sp.page[0] : sp.page);
  return Number.isInteger(n) && n > 1 ? Math.min(n, 200) : 1;
}

export function Pagination({ base, page, total }: { base: string; page: number; total: number }) {
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (pages <= 1) return null;
  const href = (n: number) => (n === 1 ? base : `${base}?page=${n}`);
  const btn = (on: boolean): React.CSSProperties => ({ minWidth: 40, padding: "8px 12px", borderRadius: 10, textAlign: "center", fontWeight: 700, fontSize: 14, textDecoration: "none", border: on ? "1.5px solid #201515" : "1px solid rgba(32,21,21,0.2)", background: on ? "#201515" : "#fffefb", color: on ? "#fffefb" : "#201515" });
  const nums: (number | "…")[] = [];
  for (let n = 1; n <= pages; n++) {
    if (n === 1 || n === pages || Math.abs(n - page) <= 1) nums.push(n);
    else if (nums[nums.length - 1] !== "…") nums.push("…");
  }
  return (
    <nav aria-label={`Page ${page} of ${pages}`} style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center", margin: "24px 0 0" }}>
      {page > 1 && <Link href={href(page - 1)} rel="prev" style={btn(false)}>‹ Previous</Link>}
      {nums.map((n, i) => n === "…"
        ? <span key={`e${i}`} style={{ alignSelf: "center", color: "#939084" }}>…</span>
        : <Link key={n} href={href(n)} aria-current={n === page ? "page" : undefined} style={btn(n === page)}>{n}</Link>)}
      {page < pages && <Link href={href(page + 1)} rel="next" style={btn(false)}>Next ›</Link>}
    </nav>
  );
}
