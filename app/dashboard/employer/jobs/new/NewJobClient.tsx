"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isEmployer } from "@/app/employers/_role";
import { EMPLOYER_COUNTRIES, JOB_TYPES } from "@/lib/employer-jobs";
import { Card, LinkBtn, Shell, useDash, INK, LINE, MUTED, PRIMARY } from "../../../_ui";
import { SubNav } from "../../_nav";
import { ET } from "../../_t";

const supabase = createClient();
const field: React.CSSProperties = { width: "100%", boxSizing: "border-box", padding: "10px 12px", fontSize: 15, border: `1px solid ${LINE}`, borderRadius: 10, fontFamily: "inherit", color: INK, background: "#fff" };

export default function NewJobClient() {
  const { d, lang } = useDash();
  const t = ET[lang];
  const [f, setF] = useState({ title: "", company: "", location: "", country: "MA", job_type: "Full-time", salary_range: "", tags: "", apply_url: "", description: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setF((p) => ({ ...p, [k]: e.target.value }));

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user || !isEmployer(user)) { window.location.href = user ? "/employers/login?wrong=1" : "/employers/login"; return; }
      const c = String(user.user_metadata?.company_name ?? "");
      if (c) setF((p) => (p.company ? p : { ...p, company: c }));
    });
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr(""); setBusy(true);
    try {
      const r = await fetch("/api/employer/jobs", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...f, tags: f.tags.split(",").map((s) => s.trim()).filter(Boolean) }) });
      const j = await r.json().catch(() => ({}));
      if (r.ok) setDone(true); else setErr(j.error || t.error);
    } catch { setErr(t.error); }
    setBusy(false);
  }

  const L = ({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) => (
    <label style={{ display: "block", marginBottom: 14 }}>
      <span style={{ display: "block", fontSize: 13.5, fontWeight: 600, marginBottom: 5 }}>{label}</span>
      {children}
      {hint && <span style={{ display: "block", fontSize: 12.5, color: MUTED, marginTop: 4 }}>{hint}</span>}
    </label>
  );

  return (
    <Shell active="employer" title={t.newTitle} sub={t.newSub}>
      <SubNav active="jobs" />
      {done ? (
        <Card title={t.sent}><LinkBtn href="/dashboard/employer/jobs" primary>{t.back}</LinkBtn></Card>
      ) : (
        <form onSubmit={submit} style={{ maxWidth: 720 }}>
          <L label={t.fTitle}><input style={field} dir="auto" value={f.title} onChange={set("title")} maxLength={120} required /></L>
          <L label={t.fCompany}><input style={field} dir="auto" value={f.company} onChange={set("company")} maxLength={100} required /></L>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
            <L label={t.fLocation}><input style={field} dir="auto" value={f.location} onChange={set("location")} maxLength={100} required /></L>
            <L label={t.fCountry}>
              <select style={field} value={f.country} onChange={set("country")}>{EMPLOYER_COUNTRIES.map((c) => <option key={c} value={c}>{d.countries[c] ?? c}</option>)}</select>
            </L>
            <L label={t.fType}>
              <select style={field} value={f.job_type} onChange={set("job_type")}>{JOB_TYPES.map((x) => <option key={x} value={x}>{x}</option>)}</select>
            </L>
            <L label={t.fSalary}><input style={field} dir="auto" value={f.salary_range} onChange={set("salary_range")} maxLength={60} /></L>
          </div>
          <L label={t.fDesc} hint={`${t.fDescHint} (${f.description.trim().length})`}>
            <textarea style={{ ...field, minHeight: 220, resize: "vertical" }} dir="auto" value={f.description} onChange={set("description")} maxLength={10000} required />
          </L>
          <L label={t.fTags}><input style={field} dir="auto" value={f.tags} onChange={set("tags")} /></L>
          <L label={t.fUrl} hint={t.fUrlHint}><input style={field} type="url" dir="ltr" value={f.apply_url} onChange={set("apply_url")} placeholder="https://" /></L>
          {err && <p role="alert" style={{ color: "#b91c1c", fontSize: 14, margin: "0 0 12px" }}>{err}</p>}
          <button type="submit" disabled={busy} style={{ fontSize: 15, fontWeight: 700, padding: "12px 22px", borderRadius: 10, border: "none", background: PRIMARY, color: "#fff", cursor: busy ? "default" : "pointer", opacity: busy ? 0.7 : 1, fontFamily: "inherit" }}>{busy ? t.sending : t.submit}</button>
        </form>
      )}
    </Shell>
  );
}
