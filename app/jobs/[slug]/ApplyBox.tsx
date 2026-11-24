"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isEmployer } from "@/app/employers/_role";

const supabase = createClient();
interface CvRow { id: string; name: string | null; updated_at: string | null }
const box: React.CSSProperties = { border: "1px solid rgba(14,26,33,0.12)", borderRadius: 12, padding: 20, margin: "0 0 28px", background: "#fff", scrollMarginTop: 80 };

/** Applies to an employer-posted job with one of the signed-in user's saved CVs plus a short message. */
export function ApplyBox({ jobId, path }: { jobId: string; path: string }) {
  const [state, setState] = useState<"loading" | "anon" | "employer" | "ready" | "sent">("loading");
  const [cvs, setCvs] = useState<CvRow[]>([]);
  const [cvId, setCvId] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setState("anon"); return; }
      if (isEmployer(user)) { setState("employer"); return; }
      const [c, a] = await Promise.all([
        supabase.from("cvs").select("id, name, updated_at").order("updated_at", { ascending: false }),
        supabase.from("applications").select("id").eq("job_id", jobId).eq("candidate_id", user.id).maybeSingle(),
      ]);
      const list = (c.data ?? []) as CvRow[];
      setCvs(list); setCvId(list[0]?.id ?? "");
      setState(a.data ? "sent" : "ready");
    })();
  }, [jobId]);

  async function send(e: React.FormEvent) {
    e.preventDefault(); setErr(""); setBusy(true);
    try {
      const r = await fetch("/api/applications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ jobId, cvId, message: msg }) });
      const j = await r.json().catch(() => ({}));
      if (r.ok || r.status === 409) setState("sent"); else setErr(j.error || "Something went wrong. Try again.");
    } catch { setErr("Something went wrong. Try again."); }
    setBusy(false);
  }

  const login = `/login?next=${encodeURIComponent(path)}`;
  const btn: React.CSSProperties = { display: "inline-block", padding: "11px 20px", borderRadius: 10, fontSize: 15, fontWeight: 700, textDecoration: "none", border: "none", background: "#0079a8", color: "#fff", cursor: "pointer", fontFamily: "inherit" };
  return (
    <section id="apply-here" style={box} aria-label="Apply">
      <h2 style={{ margin: "0 0 10px", fontSize: 18, fontWeight: 600 }}>Apply with your CV</h2>
      {state === "loading" && <p style={{ margin: 0, color: "#26343d" }}>Loading…</p>}
      {state === "anon" && (<><p style={{ margin: "0 0 12px", color: "#26343d", fontSize: 15 }}>Sign in to send one of your CVs and a short message directly to the employer.</p><a href={login} style={btn}>Sign in to apply</a></>)}
      {state === "employer" && <p style={{ margin: 0, color: "#26343d", fontSize: 15 }}>Employer accounts cannot apply to jobs. Use a job seeker account.</p>}
      {state === "sent" && <p style={{ margin: 0, color: "#15803d", fontWeight: 600 }}>Applied ✓ The employer has your CV and message.</p>}
      {state === "ready" && (cvs.length === 0 ? (
        <><p style={{ margin: "0 0 12px", color: "#26343d", fontSize: 15 }}>You need a CV to apply. Build one in a few minutes, then come back.</p><a href={`/cv/builder`} style={btn}>Build my CV</a></>
      ) : (
        <form onSubmit={send}>
          <label style={{ display: "block", fontSize: 13.5, fontWeight: 600, marginBottom: 5 }}>Your CV</label>
          <select value={cvId} onChange={(e) => setCvId(e.target.value)} style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", fontSize: 15, border: "1px solid rgba(14,26,33,0.12)", borderRadius: 10, marginBottom: 12, fontFamily: "inherit" }}>
            {cvs.map((c) => <option key={c.id} value={c.id}>{c.name || "Untitled CV"}</option>)}
          </select>
          <label style={{ display: "block", fontSize: 13.5, fontWeight: 600, marginBottom: 5 }}>Message (optional)</label>
          <textarea value={msg} onChange={(e) => setMsg(e.target.value)} maxLength={2000} rows={4} dir="auto" placeholder="Why you are a good fit, and when you can start."
            style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", fontSize: 15, border: "1px solid rgba(14,26,33,0.12)", borderRadius: 10, resize: "vertical", fontFamily: "inherit", marginBottom: 8 }} />
          <p style={{ margin: "0 0 12px", fontSize: 12.5, color: "#5f7280" }}>Your CV, name, email and message are shared with this employer.</p>
          {err && <p role="alert" style={{ color: "#b91c1c", fontSize: 14, margin: "0 0 10px" }}>{err}</p>}
          <button type="submit" disabled={busy || !cvId} style={{ ...btn, opacity: busy ? 0.7 : 1 }}>{busy ? "Sending…" : "Send application"}</button>
        </form>
      ))}
    </section>
  );
}
