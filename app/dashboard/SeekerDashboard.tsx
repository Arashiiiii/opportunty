"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { isEmployer } from "@/app/employers/_role";
import { CVDataSchema, DEFAULT_SECTION_ORDER, DEFAULT_SECTIONS_ENABLED } from "@/app/cv/_lib/schema";
import type { CVData, SectionId } from "@/app/cv/_lib/schema";
import { computeScore, scoreColor, type ScoreResult } from "@/app/cv/_lib/score";
import { ProfileCard, type Profile } from "./ProfileCard";
import { BarList, Card, Columns, Grid, Kpis, LinkBtn, Pill, Shell, Table, MUTED, PRIMARY, useDash } from "./_ui";

const supabase = createClient();

interface CvRow { id: string; name: string; updated_at: string; data: unknown; section_order: SectionId[] | null; sections_enabled: Record<SectionId, boolean> | null }
interface JobRow { id: string; title: string; company: string; location: string; tags: string[] | null; description: string | null }
interface TailorRow { id: string; cv_id: string; job_id: string; created_at: string }
interface Data { userId: string; email: string; profile: Profile | null; cvs: CvRow[]; tailorings: TailorRow[]; jobs: JobRow[]; tailoredJobs: Record<string, JobRow>; }

const dayMs = 86_400_000;

function skillsOf(cv: CVData | null): string[] {
  if (!cv) return [];
  return [...new Set(cv.skills.flatMap((g) => g.items).map((s) => s.trim().toLowerCase()).filter((s) => s.length >= 2))];
}

export default function SeekerDashboard() {
  const { d, lang } = useDash();
  const [data, setData] = useState<Data | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { window.location.href = "/login?next=/dashboard"; return; }
        if (isEmployer(user)) { window.location.href = "/dashboard/employer"; return; }
        const [cvs, tl, jobs, prof] = await Promise.all([
          supabase.from("cvs").select("id, name, updated_at, data, section_order, sections_enabled").eq("user_id", user.id).order("updated_at", { ascending: false }),
          supabase.from("cv_job_tailorings").select("id, cv_id, job_id, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(100),
          supabase.from("jobs").select("id, title, company, location, tags, description").eq("is_active", true).order("created_at", { ascending: false }).limit(300),
          supabase.from("profiles").select("full_name, headline, phone, city, linkedin, website, avatar_url").eq("user_id", user.id).maybeSingle(),
        ]);
        if (cvs.error || tl.error || jobs.error) throw new Error("load");
        const tailorings = (tl.data ?? []) as TailorRow[];
        const known = new Map((jobs.data as JobRow[]).map((j) => [j.id, j]));
        const missing = [...new Set(tailorings.map((t) => t.job_id))].filter((id) => !known.has(id));
        if (missing.length) {
          const extra = await supabase.from("jobs").select("id, title, company, location, tags, description").in("id", missing);
          (extra.data as JobRow[] | null)?.forEach((j) => known.set(j.id, j));
        }
        setData({ userId: user.id, email: user.email ?? "", profile: (prof.data as Profile | null) ?? null, cvs: (cvs.data ?? []) as CvRow[], tailorings, jobs: jobs.data as JobRow[], tailoredJobs: Object.fromEntries(known) });
      } catch { setFailed(true); }
    })();
  }, []);

  if (failed) return <Shell active="seeker" title={d.seekerTitle} sub={d.error}><div /></Shell>;
  if (!data) return <Shell active="seeker" title={d.seekerTitle} sub={d.loading}><div /></Shell>;

  const latest = data.cvs[0] ?? null;
  const parsed = latest ? CVDataSchema.safeParse(latest.data) : null;
  const cv = parsed?.success ? parsed.data : null;
  let score: ScoreResult | null = null;
  if (cv && latest) {
    const enabled = { ...DEFAULT_SECTIONS_ENABLED, ...(latest.sections_enabled ?? {}) };
    score = computeScore(cv, latest.section_order ?? DEFAULT_SECTION_ORDER, enabled);
  }

  // Match = how many of the CV's skills a job mentions (tags, title or description).
  const skills = skillsOf(cv);
  const matches = skills.length === 0 ? [] : data.jobs.map((j) => {
    const hay = `${j.title} ${(j.tags ?? []).join(" ")} ${j.description ?? ""}`.toLowerCase();
    const shared = skills.filter((s) => hay.includes(s));
    const denom = Math.max(3, Math.min((j.tags ?? []).length || 5, 8));
    return { job: j, shared, pct: Math.min(100, Math.round((shared.length / denom) * 100)) };
  }).filter((m) => m.shared.length > 0).sort((a, b) => b.pct - a.pct || b.shared.length - a.shared.length).slice(0, 8);

  // Tailorings per week, last 8 weeks (oldest → newest).
  const now = Date.now();
  const weeks = Array.from({ length: 8 }, (_, i) => 7 - i);
  const perWeek = weeks.map((w) => data.tailorings.filter((t) => {
    const age = Math.floor((now - new Date(t.created_at).getTime()) / (7 * dayMs));
    return age === w;
  }).length);
  const weekLabels = weeks.map((w) => (w === 0 ? "•" : `-${w}w`));

  const fmtDate = (iso: string) => new Date(iso).toLocaleDateString(lang === "ar" ? "ar-MA" : lang === "fr" ? "fr-FR" : "en-GB", { day: "numeric", month: "short" });
  const todo = score?.items.filter((i) => !i.done) ?? [];

  return (
    <Shell active="seeker" title={d.seekerTitle} sub={d.seekerSub}>
      <ProfileCard userId={data.userId} email={data.email} profile={data.profile} latestCV={cv} onSaved={(p) => setData((s) => (s ? { ...s, profile: p } : s))} />
      <Kpis items={[
        { label: d.kCVs, value: String(data.cvs.length), note: d.kCVsNote },
        { label: d.kScore, value: score ? String(score.value) : "—", note: d.kScoreNote, color: score ? scoreColor(score.value) : undefined },
        { label: d.kTailored, value: String(data.tailorings.length), note: d.kTailoredNote },
        { label: d.kMatch, value: matches[0] ? `${matches[0].pct}%` : "—", note: d.kMatchNote },
      ]} />

      {data.cvs.length > 0 && (
      <Card title={d.myCVs} sub={d.cvsSub} style={{ marginBottom: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: 12 }}>
          {data.cvs.slice(0, 5).map((c) => (
            <Link key={c.id} href={`/cv/${c.id}`} style={{ display: "flex", flexDirection: "column", gap: 4, padding: "14px 16px", border: "1px solid rgba(14,26,33,0.12)", borderRadius: 12, background: "#ffffff", textDecoration: "none", color: "inherit", minWidth: 0 }}>
              <span dir="auto" style={{ fontWeight: 700, fontSize: 15, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name || "CV"}</span>
              <span style={{ fontSize: 12.5, color: MUTED }}>{d.updated} {fmtDate(c.updated_at)}</span>
              <span style={{ fontSize: 13, color: PRIMARY, fontWeight: 700, marginTop: 4 }}>{d.openCV} →</span>
            </Link>
          ))}
          <Link href="/cv/builder" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 84, border: "2px dashed rgba(14,26,33,0.24)", borderRadius: 12, textDecoration: "none", color: PRIMARY, fontWeight: 700, fontSize: 14.5 }}>+ {d.newCV}</Link>
        </div>
        {data.cvs.length > 5 && <div style={{ marginTop: 12 }}><Link href="/cv" style={{ fontSize: 13.5, color: MUTED, fontWeight: 600 }}>{d.manageAll} →</Link></div>}
      </Card>
      )}

      {!latest && (
        <Card title={d.noCV} sub={d.noCVNote}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <LinkBtn href="/cv/builder" primary>{d.createCV}</LinkBtn>
            <LinkBtn href="/">{d.browseJobs}</LinkBtn>
          </div>
        </Card>
      )}

      {latest && (
        <>
          <Grid>
            <Card title={d.checklist} sub={d.checklistSub}>
              {todo.length === 0 ? <div style={{ color: "#166534", fontSize: 14 }}>{d.allDone}</div> : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {todo.slice(0, 6).map((i) => (
                    <div key={i.id} style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 14 }}>
                      <span>{d.scoreItems[i.id] ?? i.label}</span>
                      <Pill>+{i.delta}</Pill>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
                <LinkBtn href={`/cv/${latest.id}`} primary>{d.openBuilder}</LinkBtn>
                <LinkBtn href="/">{d.tailorCta}</LinkBtn>
              </div>
            </Card>
            <Card title={d.activity} sub={d.activitySub}>
              <Columns values={perWeek} labels={weekLabels} empty={d.noActivity} />
            </Card>
          </Grid>

          <Card title={d.matches} sub={d.matchesSub} style={{ marginBottom: 16 }}>
            {matches.length === 0 ? <div style={{ color: "#5f7280", fontSize: 14 }}>{d.noMatches}</div> : (
              <Table
                head={[d.jobCol, d.companyCol, d.matchCol, d.skillsCol]}
                empty={d.noMatches}
                rows={matches.map((m) => [
                  <span key="t" dir="auto" style={{ fontWeight: 600 }}>{m.job.title}</span>,
                  <span key="c" dir="auto" style={{ color: MUTED }}>{m.job.company}</span>,
                  <BarList key="b" rows={[{ label: "", value: m.pct, hint: `${m.pct}%` }]} empty="" />,
                  <span key="s" dir="auto" style={{ color: MUTED, fontSize: 13 }}>{m.shared.slice(0, 4).join(", ")}</span>,
                ])}
              />
            )}
          </Card>

          <Grid>
            <Card title={d.tailored} sub={d.tailoredSub}>
              <Table
                head={[d.jobCol, d.companyCol, d.whenCol, d.openCol]}
                empty={d.noTailored}
                rows={data.tailorings.slice(0, 8).map((t) => {
                  const j = data.tailoredJobs[t.job_id];
                  return [
                    <span key="t" dir="auto" style={{ fontWeight: 600 }}>{j?.title ?? "—"}</span>,
                    <span key="c" dir="auto" style={{ color: MUTED }}>{j?.company ?? "—"}</span>,
                    fmtDate(t.created_at),
                    <Link key="o" href={`/cv/${t.cv_id}`} style={{ color: PRIMARY, fontWeight: 700, textDecoration: "none" }}>{d.openCV}</Link>,
                  ];
                })}
              />
            </Card>
          </Grid>
        </>
      )}
    </Shell>
  );
}
