"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { jobPath } from "@/lib/jobs-seo";
import { isEmployer } from "@/app/employers/_role";
import { Card, LinkBtn, Pill, Shell, Table, useDash, MUTED } from "../../_ui";
import { SubNav } from "../_nav";
import { ET } from "../_t";

const supabase = createClient();
interface Row { id: string; title: string; company: string; location: string; is_active: boolean; moderation: string; created_at: string }

export default function JobsClient() {
  const { d, lang } = useDash();
  const t = ET[lang];
  const [rows, setRows] = useState<Row[] | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState("");

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !isEmployer(user)) { window.location.href = user ? "/employers/login?wrong=1" : "/employers/login"; return; }
    const [j, a] = await Promise.all([
      supabase.from("jobs").select("id, title, company, location, is_active, moderation, created_at").eq("employer_id", user.id).order("created_at", { ascending: false }),
      supabase.from("applications").select("job_id").eq("employer_id", user.id),
    ]);
    if (j.error) { setFailed(true); return; }
    const c: Record<string, number> = {};
    (a.data ?? []).forEach((x: { job_id: string }) => { c[x.job_id] = (c[x.job_id] ?? 0) + 1; });
    setCounts(c); setRows((j.data ?? []) as Row[]);
  }, []);
  useEffect(() => { load(); }, [load]);

  async function act(id: string, action: "close" | "reopen") {
    setBusy(id);
    const r = await fetch(`/api/employer/jobs/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }) });
    setBusy(""); if (r.ok) load(); else setFailed(true);
  }

  const status = (r: Row) =>
    r.moderation === "pending" ? <Pill key="s" color="#b45309">{t.stPending}</Pill>
    : r.moderation === "rejected" ? <Pill key="s" color="#b91c1c">{t.stRejected}</Pill>
    : r.is_active ? <Pill key="s" color="#15803d">{t.stLive}</Pill> : <Pill key="s" color="#5f7280">{t.stClosed}</Pill>;

  if (failed) return <Shell active="employer" title={t.jobsTitle} sub={t.error}><SubNav active="jobs" /></Shell>;
  return (
    <Shell active="employer" title={t.jobsTitle} sub={t.jobsSub}>
      <SubNav active="jobs" />
      <div style={{ marginBottom: 16 }}><LinkBtn href="/dashboard/employer/jobs/new" primary>{t.post}</LinkBtn></div>
      {!rows ? <p style={{ color: MUTED }}>{d.loading}</p> : (
        <Card title={t.jobsTitle}>
          <Table
            head={[t.colJob, t.colStatus, t.colApplicants, t.colPosted, ""]}
            empty={t.noJobs}
            rows={rows.map((r) => [
              r.is_active ? <Link key="t" href={jobPath(r)} dir="auto" style={{ fontWeight: 600, color: "inherit" }}>{r.title}</Link> : <span key="t" dir="auto" style={{ fontWeight: 600 }}>{r.title}</span>,
              status(r),
              counts[r.id] ? <Link key="c" href="/dashboard/employer/applications" style={{ fontWeight: 700 }}>{counts[r.id]}</Link> : "0",
              new Date(r.created_at).toLocaleDateString(lang),
              r.moderation === "approved" ? (
                <button key="b" disabled={busy === r.id} onClick={() => act(r.id, r.is_active ? "close" : "reopen")}
                  style={{ fontSize: 13, fontWeight: 600, padding: "6px 12px", borderRadius: 8, border: "1px solid rgba(14,26,33,0.24)", background: "#fff", cursor: "pointer", fontFamily: "inherit" }}>{r.is_active ? t.close : t.reopen}</button>
              ) : "",
            ])}
          />
          {rows.some((r) => r.moderation === "pending") && <p style={{ marginTop: 14, fontSize: 13.5, color: MUTED }}>{t.pendingNote}</p>}
        </Card>
      )}
    </Shell>
  );
}
