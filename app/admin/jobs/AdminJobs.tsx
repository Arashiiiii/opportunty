"use client";
import { useState } from "react";

interface J { id: string; title: string; company: string; location: string; Country: string | null; job_type: string | null; salary_range: string | null; description: string | null; external_url: string | null; created_at: string }

export function AdminJobs({ jobs }: { jobs: J[] }) {
  const [left, setLeft] = useState(jobs);
  const [busy, setBusy] = useState("");
  const [err, setErr] = useState("");
  async function act(id: string, action: "approve" | "reject") {
    setBusy(id); setErr("");
    const r = await fetch(`/api/admin/jobs/${id}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }) });
    setBusy("");
    if (r.ok) setLeft((p) => p.filter((x) => x.id !== id)); else setErr((await r.json().catch(() => ({}))).error || "Failed");
  }
  const b: React.CSSProperties = { fontSize: 14, fontWeight: 700, padding: "9px 18px", borderRadius: 9, border: "none", cursor: "pointer", fontFamily: "inherit", color: "#fff" };
  return (
    <main style={{ maxWidth: 820, margin: "0 auto", padding: "32px 20px 80px", fontFamily: "system-ui, sans-serif", color: "#0e1a21" }}>
      <h1 style={{ fontSize: 28, fontWeight: 600 }}>Jobs waiting for approval ({left.length})</h1>
      {err && <p role="alert" style={{ color: "#b91c1c" }}>{err}</p>}
      {!left.length && <p>Nothing to review.</p>}
      {left.map((j) => (
        <article key={j.id} style={{ border: "1px solid rgba(14,26,33,0.15)", borderRadius: 12, padding: 18, margin: "16px 0" }}>
          <h2 dir="auto" style={{ margin: 0, fontSize: 20 }}>{j.title}</h2>
          <p dir="auto" style={{ margin: "4px 0 10px", color: "#26343d" }}>{[j.company, j.location, j.Country, j.job_type, j.salary_range].filter(Boolean).join(" · ")}{j.external_url ? ` · apply: ${j.external_url}` : " · apply: in-app"}</p>
          <p dir="auto" style={{ whiteSpace: "pre-wrap", fontSize: 14.5, lineHeight: 1.6, maxHeight: 260, overflow: "auto", margin: "0 0 14px" }}>{j.description}</p>
          <div style={{ display: "flex", gap: 10 }}>
            <button disabled={busy === j.id} onClick={() => act(j.id, "approve")} style={{ ...b, background: "#15803d" }}>Approve</button>
            <button disabled={busy === j.id} onClick={() => { if (confirm("Reject this job?")) act(j.id, "reject"); }} style={{ ...b, background: "#b91c1c" }}>Reject</button>
          </div>
        </article>
      ))}
    </main>
  );
}
