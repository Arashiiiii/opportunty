"use client";
import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isEmployer } from "@/app/employers/_role";
import { APPLICATION_STATUSES, type ApplicationStatus } from "@/lib/employer-jobs";
import { Card, Pill, Shell, useDash, INK, LINE, MUTED, PRIMARY } from "../../_ui";
import { SubNav } from "../_nav";
import { ET } from "../_t";
import type { CVData } from "@/app/cv/_lib/schema";

const supabase = createClient();
interface App {
  id: string; job_id: string; candidate_name: string; candidate_email: string; message: string | null; cv_name: string | null;
  status: ApplicationStatus; created_at: string; cv_snapshot: { cv?: CVData } | null;
}
interface JobLite { id: string; title: string }
const COLORS: Record<ApplicationStatus, string> = { new: "#0079a8", viewed: "#5f7280", shortlisted: "#15803d", rejected: "#b91c1c", hired: "#7c3aed" };

export default function ApplicationsClient() {
  const { lang } = useDash();
  const t = ET[lang];
  const [apps, setApps] = useState<App[] | null>(null);
  const [jobs, setJobs] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState("");
  const [openId, setOpenId] = useState("");
  const [failed, setFailed] = useState(false);

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !isEmployer(user)) { window.location.href = user ? "/employers/login?wrong=1" : "/employers/login"; return; }
    const [a, j] = await Promise.all([
      supabase.from("applications").select("id, job_id, candidate_name, candidate_email, message, cv_name, status, created_at, cv_snapshot").eq("employer_id", user.id).order("created_at", { ascending: false }),
      supabase.from("jobs").select("id, title").eq("employer_id", user.id),
    ]);
    if (a.error || j.error) { setFailed(true); return; }
    setJobs(Object.fromEntries(((j.data ?? []) as JobLite[]).map((x) => [x.id, x.title])));
    setApps((a.data ?? []) as App[]);
  }, []);
  useEffect(() => { load(); }, [load]);

  const label: Record<ApplicationStatus, string> = { new: t.stNew, viewed: t.stViewed, shortlisted: t.stShort, rejected: t.stRej, hired: t.stHired };

  async function setStatus(id: string, status: ApplicationStatus) {
    setApps((p) => p && p.map((x) => (x.id === id ? { ...x, status } : x)));
    const r = await fetch(`/api/applications/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    if (!r.ok) load();
  }
  function toggle(a: App) {
    const opening = openId !== a.id;
    setOpenId(opening ? a.id : "");
    if (opening && a.status === "new") setStatus(a.id, "viewed");
  }

  if (failed) return <Shell active="employer" title={t.appsTitle} sub={t.error}><SubNav active="apps" /></Shell>;
  const list = (apps ?? []).filter((a) => !filter || a.job_id === filter);
  return (
    <Shell active="employer" title={t.appsTitle} sub={t.appsSub}>
      <SubNav active="apps" />
      {!apps ? <p style={{ color: MUTED }}>{t.loading}</p> : (
        <>
          {Object.keys(jobs).length > 1 && (
            <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ marginBottom: 14, padding: "8px 12px", fontSize: 14, border: `1px solid ${LINE}`, borderRadius: 10, fontFamily: "inherit" }}>
              <option value="">{t.allJobs}</option>
              {Object.entries(jobs).map(([id, title]) => <option key={id} value={id}>{title}</option>)}
            </select>
          )}
          {!list.length ? <Card title={t.appsTitle}><p style={{ margin: 0, color: MUTED }}>{t.noApps}</p></Card> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {list.map((a) => (
                <section key={a.id} style={{ border: `1px solid ${LINE}`, borderRadius: 12, padding: 16, background: "#fff" }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ minWidth: 0 }}>
                      <div dir="auto" style={{ fontWeight: 700, fontSize: 16 }}>{a.candidate_name}</div>
                      <div dir="auto" style={{ fontSize: 13.5, color: MUTED }}>{jobs[a.job_id] ?? ""} · {new Date(a.created_at).toLocaleDateString(lang)}</div>
                    </div>
                    <Pill color={COLORS[a.status]}>{label[a.status]}</Pill>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12, alignItems: "center" }}>
                    <button onClick={() => toggle(a)} style={{ fontSize: 13.5, fontWeight: 700, padding: "7px 14px", borderRadius: 9, border: "none", background: PRIMARY, color: "#fff", cursor: "pointer", fontFamily: "inherit" }}>{openId === a.id ? t.hide : t.open}</button>
                    {APPLICATION_STATUSES.filter((s) => s !== "new" && s !== "viewed").map((s) => (
                      <button key={s} disabled={a.status === s} onClick={() => setStatus(a.id, s)}
                        style={{ fontSize: 13, fontWeight: 600, padding: "6px 12px", borderRadius: 9, border: `1px solid ${LINE}`, background: a.status === s ? "#f3f2ed" : "#fff", color: INK, cursor: a.status === s ? "default" : "pointer", fontFamily: "inherit" }}>{label[s]}</button>
                    ))}
                  </div>
                  {openId === a.id && <CvView a={a} t={t} />}
                </section>
              ))}
            </div>
          )}
        </>
      )}
    </Shell>
  );
}

function CvView({ a, t }: { a: App; t: Record<string, string> }) {
  const cv = a.cv_snapshot?.cv;
  const h: React.CSSProperties = { margin: "18px 0 6px", fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: MUTED };
  const range = (s?: string, e?: string, cur?: boolean) => [s, cur ? t.present : e].filter(Boolean).join(" – ");
  return (
    <div style={{ marginTop: 16, paddingTop: 4, borderTop: `1px solid ${LINE}`, fontSize: 14.5, lineHeight: 1.55 }}>
      <h3 style={h}>{t.contact}</h3>
      <div dir="auto"><a href={`mailto:${a.candidate_email}`}>{a.candidate_email}</a>{cv?.profile?.phone ? ` · ${cv.profile.phone}` : ""}{cv?.profile?.city ? ` · ${cv.profile.city}` : ""}</div>
      {a.message && (<><h3 style={h}>{t.message}</h3><p dir="auto" style={{ margin: 0, whiteSpace: "pre-wrap" }}>{a.message}</p></>)}
      {cv ? (
        <>
          {cv.profile?.title && <div dir="auto" style={{ marginTop: 14, fontWeight: 600 }}>{cv.profile.title}</div>}
          {cv.summary && (<><h3 style={h}>{t.summary}</h3><p dir="auto" style={{ margin: 0, whiteSpace: "pre-wrap" }}>{cv.summary}</p></>)}
          {!!cv.experience?.length && (<><h3 style={h}>{t.experience}</h3>{cv.experience.map((x) => (
            <div key={x.id} dir="auto" style={{ marginBottom: 10 }}>
              <strong>{x.role}</strong>{x.company ? ` · ${x.company}` : ""}<div style={{ color: MUTED, fontSize: 13 }}>{range(x.start, x.end, x.current)}</div>
              {!!x.bullets?.length && <ul style={{ margin: "4px 0 0", paddingInlineStart: 20 }}>{x.bullets.filter(Boolean).map((b, i) => <li key={i}>{b}</li>)}</ul>}
            </div>))}</>)}
          {!!cv.education?.length && (<><h3 style={h}>{t.education}</h3>{cv.education.map((x) => (
            <div key={x.id} dir="auto" style={{ marginBottom: 6 }}><strong>{x.degree}</strong>{x.school ? ` · ${x.school}` : ""} <span style={{ color: MUTED, fontSize: 13 }}>{range(x.start, x.end)}</span></div>))}</>)}
          {!!cv.skills?.length && (<><h3 style={h}>{t.skills}</h3>{cv.skills.map((g) => <div key={g.id} dir="auto"><strong>{g.group}</strong>: {g.items.join(", ")}</div>)}</>)}
          {!!cv.languages?.length && (<><h3 style={h}>{t.languages}</h3><div dir="auto">{cv.languages.map((l) => `${l.name} (${l.level})`).join(" · ")}</div></>)}
          {!!cv.certifications?.length && (<><h3 style={h}>{t.certs}</h3>{cv.certifications.map((c) => <div key={c.id} dir="auto">{c.name}{c.issuer ? ` · ${c.issuer}` : ""}{c.year ? ` · ${c.year}` : ""}</div>)}</>)}
          {!!cv.projects?.length && (<><h3 style={h}>{t.projects}</h3>{cv.projects.map((p) => <div key={p.id} dir="auto" style={{ marginBottom: 6 }}><strong>{p.name}</strong>{p.role ? ` · ${p.role}` : ""}<div>{p.detail}</div></div>)}</>)}
        </>
      ) : null}
    </div>
  );
}
