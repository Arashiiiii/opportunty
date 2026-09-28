"use client";
/**
 * opportunity.com homepage — built from the approved design mockup
 * (Artifact 6eda429d…): search bar, job feed (left) + CV space (right),
 * CV template strip below.
 *
 * Differences from a static mockup:
 *  - Job feed reads from the real `jobs` table (falls back to the same
 *    placeholder listings the mockup used if the table is still empty —
 *    clearly a placeholder, swap for real postings).
 *  - Dragging a job onto the CV panel, or clicking "Download tailored CV" /
 *    "Upload your CV", requires a signed-in account — opportunity.com has
 *    no anonymous sessions, so a signed-out visitor sees a login prompt
 *    instead of the action silently doing nothing.
 *  - The tailoring step is still a visual placeholder (spinner + a generic
 *    "matches" card) — there's no AI tailoring endpoint wired up yet, so a
 *    signed-in user is routed into the real CV builder afterwards rather
 *    than a fake PDF download.
 */
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { TEMPLATE_REGISTRY } from "./cv/_lib/schema";
import type { TemplateId } from "./cv/_lib/schema";
import { TemplateThumb } from "./TemplateThumb";

const PRIMARY = "#ff4f00";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  job_type: string;
  salary_range: string;
  tags: string[];
  description: string;
}

const PLACEHOLDER_JOBS: Job[] = [
  { id: "1", title: "Senior Backend Engineer", company: "Atlas Cloud", location: "Casablanca", job_type: "Full-time", salary_range: "25,000–35,000 MAD", tags: ["Node.js", "PostgreSQL", "AWS"], description: "Own core API services for a fast-growing fintech platform used across North Africa." },
  { id: "2", title: "Product Designer", company: "Cedar Studio", location: "Casablanca", job_type: "Full-time", salary_range: "15,000–20,000 MAD", tags: ["Figma", "Design systems", "UX research"], description: "Shape the product experience for a design-led SaaS studio working with regional retailers." },
  { id: "3", title: "DevOps Engineer", company: "Meridian Bank", location: "Casablanca", job_type: "Full-time", salary_range: "20,000–28,000 MAD", tags: ["Kubernetes", "CI/CD", "Terraform"], description: "Modernize deployment pipelines for a bank's digital-first lending platform." },
  { id: "4", title: "Growth Marketing Manager", company: "Route6 Logistics", location: "Tangier", job_type: "Full-time", salary_range: "12,000–18,000 MAD", tags: ["SEO", "Paid media", "Analytics"], description: "Drive customer acquisition for a logistics platform expanding across the Maghreb." },
  { id: "5", title: "Data Analyst", company: "BluePeak Analytics", location: "Rabat", job_type: "Hybrid", salary_range: "14,000–19,000 MAD", tags: ["SQL", "Python", "Tableau"], description: "Turn operational data into decisions for consumer-goods clients across Morocco." },
  { id: "6", title: "Frontend Developer", company: "Atlas Cloud", location: "Casablanca", job_type: "Remote", salary_range: "18,000–24,000 MAD", tags: ["React", "TypeScript", "Tailwind"], description: "Build the customer dashboard for a fintech product used by thousands of SMEs." },
];

const supabase = createClient();

export default function HomeClient() {
  const router = useRouter();
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [jobs, setJobs] = useState<Job[]>(PLACEHOLDER_JOBS);
  const [usingPlaceholders, setUsingPlaceholders] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [cvJobId, setCvJobId] = useState<string | null>(null);
  const [tailoring, setTailoring] = useState(false);
  const [templateId, setTemplateId] = useState<TemplateId | null>(null);
  const [showLoginGate, setShowLoginGate] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setAuthed(!!user));

    supabase
      .from("jobs")
      .select("id, title, company, location, job_type, salary_range, tags, description")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          setJobs(data as Job[]);
          setUsingPlaceholders(false);
        }
      });
  }, []);

  const requireAuth = useCallback((): boolean => {
    if (!authed) {
      setShowLoginGate(true);
      return false;
    }
    return true;
  }, [authed]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (!requireAuth()) return;
    const id = e.dataTransfer.getData("text/plain");
    setCvJobId(id);
    setTailoring(true);
    setTimeout(() => setTailoring(false), 1300);
  }, [requireAuth]);

  const cvJob = jobs.find((j) => j.id === cvJobId) ?? null;
  const showResult = !!cvJob && !tailoring;
  const showEmpty = !cvJob && !tailoring;

  return (
    <div style={{ width: "100%", minHeight: "100vh", background: "#fffefb", display: "flex", flexDirection: "column", fontFamily: "'Inter', system-ui, -apple-system, sans-serif", color: "#201515" }}>

      {/* Header */}
      <header style={{ position: "sticky", top: 0, zIndex: 20, background: "#fffefb", borderBottom: "1px solid rgba(32,21,21,0.12)", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px" }}>
        <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.5px" }}>opportunity<span style={{ color: PRIMARY }}>.</span></div>
        <nav style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <a href="#" style={{ fontSize: 16, textDecoration: "none", color: "#605d52" }}>For employers</a>
          {authed ? (
            <Link href="/cv" style={{ fontSize: 16, textDecoration: "none", color: "#605d52" }}>My CVs</Link>
          ) : (
            <Link href="/login" style={{ fontSize: 16, textDecoration: "none", color: "#605d52" }}>Sign in</Link>
          )}
          <button type="button" style={{ fontSize: 14.4, fontWeight: 700, letterSpacing: "0.144px", padding: "12px 24px", borderRadius: 12, border: "none", background: PRIMARY, color: "#fffefb", cursor: "pointer", fontFamily: "inherit" }}>
            Post a job
          </button>
        </nav>
      </header>

      {/* Hero + search */}
      <div style={{ padding: "64px 24px 40px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <div style={{ fontSize: 14, fontWeight: 500, letterSpacing: 1, textTransform: "uppercase", color: PRIMARY, marginBottom: 12 }}>Morocco&apos;s job board</div>
        <h1 style={{ margin: "0 0 12px", fontSize: 56, lineHeight: "56px", fontWeight: 500, maxWidth: 680 }}>Find work you actually want</h1>
        <p style={{ margin: "0 0 32px", fontSize: 20, lineHeight: "30px", letterSpacing: "-0.2px", color: "#605d52", maxWidth: 480 }}>
          Search open roles across Morocco, then drag one into your CV and let AI tailor it to the job.
        </p>

        <div style={{ width: "100%", maxWidth: 720, display: "flex", alignItems: "center", background: "#f8f4f0", border: "1px solid rgba(32,21,21,0.12)", borderRadius: 12, padding: 6, gap: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexGrow: 1, padding: "8px 12px" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#939084" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            <input type="text" placeholder="Job title, skill or company" style={{ border: "none", outline: "none", fontSize: 16, fontFamily: "inherit", width: "100%", color: "#201515", background: "transparent" }} />
          </div>
          <div style={{ width: 1, height: 24, background: "rgba(32,21,21,0.12)" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", minWidth: 160 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#939084" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
            <span style={{ fontSize: 16, color: "#605d52" }}>All of Morocco</span>
          </div>
          <button type="button" style={{ fontSize: 14.4, fontWeight: 700, letterSpacing: "0.144px", padding: "12px 24px", borderRadius: 6, border: "none", background: PRIMARY, color: "#fffefb", cursor: "pointer", whiteSpace: "nowrap", fontFamily: "inherit" }}>
            Search
          </button>
        </div>
      </div>

      {/* Two-column workspace */}
      <div style={{ width: "100%", maxWidth: 1280, margin: "0 auto", padding: "8px 24px 32px", display: "grid", gridTemplateColumns: "minmax(320px, 1fr) minmax(380px, 1.15fr)", gap: 24, alignItems: "start" }}>

        {/* Left: job feed */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 14, color: "#605d52" }}>
            {jobs.length} open roles · drag any card into your CV
            {usingPlaceholders && <span style={{ color: "#c5a15a" }}> (sample listings — connect real postings)</span>}
          </div>

          {jobs.map((job) => {
            const isExpanded = expandedId === job.id;
            return (
              <div
                key={job.id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData("text/plain", job.id);
                  e.dataTransfer.effectAllowed = "move";
                }}
                style={{ background: "#f8f4f0", border: "1px solid rgba(32,21,21,0.12)", borderRadius: 12, padding: 24, cursor: "grab" }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 24, lineHeight: "30px", fontWeight: 600, letterSpacing: "-0.6px", marginBottom: 4 }}>{job.title}</div>
                    <div style={{ fontSize: 16, lineHeight: "24px", color: "#605d52" }}>{job.company} · {job.location} · {job.job_type}</div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, background: "#fffefb", border: "1px solid rgba(32,21,21,0.12)", borderRadius: 9999, padding: "4px 12px", whiteSpace: "nowrap" }}>{job.salary_range}</div>
                </div>

                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 14 }}>
                  {job.tags.map((tag) => (
                    <span key={tag} style={{ fontSize: 14, color: "#605d52", border: "1px solid rgba(32,21,21,0.12)", borderRadius: 9999, padding: "3px 12px" }}>{tag}</span>
                  ))}
                </div>

                {isExpanded && (
                  <p style={{ fontSize: 16, lineHeight: "24px", color: "#36342e", margin: "14px 0 0", paddingTop: 14, borderTop: "1px solid rgba(32,21,21,0.12)" }}>{job.description}</p>
                )}

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14, paddingTop: 14, borderTop: "1px solid rgba(32,21,21,0.12)" }}>
                  <button type="button" onClick={() => setExpandedId(isExpanded ? null : job.id)} style={{ fontSize: 14.4, fontWeight: 700, letterSpacing: "0.144px", background: "none", border: "none", padding: 0, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 2, fontFamily: "inherit" }}>
                    {isExpanded ? "Hide details" : "View details"}
                  </button>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#939084" }}>
                    <span style={{ fontSize: 14 }}>Drag to CV</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#939084" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="6" r="1" /><circle cx="15" cy="6" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="9" cy="18" r="1" /><circle cx="15" cy="18" r="1" /></svg>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: CV space */}
        <div style={{ position: "sticky", top: 88 }}>
          <div style={{ background: "#f8f4f0", border: "1px solid rgba(32,21,21,0.12)", borderRadius: 12, padding: 24 }}>
            <div style={{ fontSize: 20, lineHeight: "25px", fontWeight: 700, letterSpacing: "-0.5px", marginBottom: 4 }}>Your CV</div>
            <p style={{ fontSize: 16, lineHeight: "24px", color: "#605d52", margin: "0 0 24px" }}>Drag a job from the left and we&apos;ll tailor your CV to it.</p>

            {showEmpty && (
              <div
                onDragOver={(e) => { e.preventDefault(); if (!dragOver) setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                style={{ border: `2px dashed ${dragOver ? PRIMARY : "rgba(32,21,21,0.24)"}`, borderRadius: 12, padding: "48px 24px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 14, transition: "border-color 120ms", background: "#fffefb" }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#939084" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                <div style={{ fontSize: 16, color: "#605d52", maxWidth: 220 }}>Drop a job here, or</div>
                <button type="button" onClick={() => (requireAuth() ? router.push("/cv") : null)} style={{ fontSize: 14.4, fontWeight: 700, letterSpacing: "0.144px", padding: "12px 24px", borderRadius: 12, border: "1px solid rgba(32,21,21,0.24)", background: "#fffefb", color: "#201515", cursor: "pointer", fontFamily: "inherit" }}>
                  Upload your CV
                </button>
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); if (requireAuth()) router.push("/cv"); }}
                  style={{ fontSize: 14, color: "#605d52", textDecoration: "underline", textUnderlineOffset: 2 }}
                >
                  Use my saved CV instead
                </a>
              </div>
            )}

            {tailoring && (
              <div style={{ border: "1px solid rgba(32,21,21,0.12)", borderRadius: 12, padding: "40px 24px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 14, background: "#fffefb" }}>
                <div style={{ width: 32, height: 32, borderRadius: 9999, border: "3px solid rgba(32,21,21,0.12)", borderTopColor: PRIMARY, animation: "spin 0.8s linear infinite" }} />
                <div style={{ fontSize: 16, color: "#36342e" }}>Tailoring your CV for <span style={{ fontWeight: 600 }}>{cvJob?.title}</span> at {cvJob?.company}…</div>
              </div>
            )}

            {showResult && cvJob && (
              <div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: PRIMARY, color: "#fffefb", fontSize: 14, fontWeight: 600, borderRadius: 9999, padding: "5px 14px", marginBottom: 16 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fffefb" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  Tailored for {cvJob.title}
                </div>

                <div style={{ border: "1px solid rgba(32,21,21,0.12)", borderRadius: 12, padding: 20, background: "#fffefb" }}>
                  <div style={{ fontSize: 20, lineHeight: "25px", fontWeight: 700, letterSpacing: "-0.5px" }}>[Your name]</div>
                  <div style={{ fontSize: 16, lineHeight: "24px", color: "#605d52", marginBottom: 16 }}>{cvJob.title} · {cvJob.location}</div>
                  <p style={{ fontSize: 16, lineHeight: "24px", color: "#36342e", margin: "0 0 16px" }}>
                    Summary rewritten to lead with the experience {cvJob.company} is asking for, matched against your saved CV and past uploads.
                  </p>

                  <div style={{ fontSize: 14, fontWeight: 600, color: "#605d52", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Key matches</div>
                  {cvJob.tags.map((tag) => (
                    <div key={tag} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 16, color: "#36342e", marginBottom: 6 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={PRIMARY} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                      {tag} — carried over from your CV
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                  <button
                    type="button"
                    onClick={() => { if (requireAuth()) router.push("/cv"); }}
                    style={{ flexGrow: 1, fontSize: 18, lineHeight: "27px", fontWeight: 600, padding: 12, borderRadius: 12, border: "none", background: PRIMARY, color: "#fffefb", cursor: "pointer", fontFamily: "inherit" }}
                  >
                    Continue in CV builder
                  </button>
                  <button type="button" onClick={() => { setCvJobId(null); setTailoring(false); setDragOver(false); }} style={{ fontSize: 14.4, fontWeight: 700, letterSpacing: "0.144px", padding: "12px 16px", borderRadius: 12, border: "1px solid rgba(32,21,21,0.24)", background: "#fffefb", color: "#201515", cursor: "pointer", fontFamily: "inherit" }}>
                    Start over
                  </button>
                </div>
                <p style={{ fontSize: 14, color: "#c5c0b1", margin: "12px 0 0" }}>Based on your saved CV and previous uploads.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CV templates */}
      <div style={{ width: "100%", maxWidth: 1280, margin: "0 auto", padding: "32px 24px 96px", borderTop: "1px solid rgba(32,21,21,0.12)" }}>
        <div style={{ fontSize: 14, fontWeight: 500, letterSpacing: 1, textTransform: "uppercase", color: PRIMARY, marginBottom: 8 }}>Pay once, no subscription</div>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
          <div style={{ fontSize: 32, lineHeight: "36px", fontWeight: 500, letterSpacing: 1 }}>Choose a CV template</div>
          <div style={{ fontSize: 16, color: "#605d52" }}>10 ATS-compatible templates · used to build the CV on the right</div>
        </div>

        <div style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 8 }}>
          {TEMPLATE_REGISTRY.map((tpl) => {
            const selected = templateId === tpl.id;
            return (
              <div key={tpl.id} style={{ flex: "0 0 200px", background: "#f8f4f0", border: `2px solid ${selected ? PRIMARY : "rgba(32,21,21,0.12)"}`, borderRadius: 12, padding: 12, position: "relative" }}>
                {selected && (
                  <div style={{ position: "absolute", top: 10, right: 10, width: 20, height: 20, borderRadius: 9999, background: PRIMARY, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fffefb" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  </div>
                )}

                <div style={{ background: "#fffefb", border: "1px solid rgba(32,21,21,0.12)", borderRadius: 8, padding: 10, height: 130, marginBottom: 10, overflow: "hidden" }}>
                  <TemplateThumb id={tpl.id} accent={tpl.accent} />
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                  <div style={{ fontSize: 16, lineHeight: "24px", fontWeight: 600 }}>{tpl.name}</div>
                  <span style={{ fontSize: 11, lineHeight: "15px", fontWeight: 700, letterSpacing: "0.144px", color: tpl.accent, background: hexToRgbaLite(tpl.accent), borderRadius: 9999, padding: "1px 8px", whiteSpace: "nowrap" }}>Pro</span>
                </div>
                <div style={{ fontSize: 14, lineHeight: "21px", color: "#939084", marginBottom: 10 }}>{tpl.sub}</div>

                <button
                  type="button"
                  onClick={() => { setTemplateId(selected ? null : tpl.id); if (requireAuth()) router.push("/cv"); }}
                  style={{ width: "100%", fontSize: 14.4, fontWeight: 700, letterSpacing: "0.144px", padding: 8, borderRadius: 8, border: "1px solid rgba(32,21,21,0.24)", background: "#fffefb", color: "#201515", cursor: "pointer", fontFamily: "inherit" }}
                >
                  {selected ? "Selected" : "Use this template"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {showLoginGate && <LoginGateModal onClose={() => setShowLoginGate(false)} />}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function hexToRgbaLite(hex: string) {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r},${g},${b},0.1)`;
}

function LoginGateModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 9000, background: "rgba(32,21,21,0.55)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: "#fffefb", borderRadius: 16, padding: 32, width: "100%", maxWidth: 380, textAlign: "center", boxShadow: "0 24px 64px rgba(0,0,0,.2)" }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: "linear-gradient(135deg, #ff4f00 0%, #ff4f00 50%, #201515 50%, #201515 100%)", margin: "0 auto 16px" }} />
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 8px" }}>Sign in to continue</h2>
        <p style={{ fontSize: 14, color: "#605d52", margin: "0 0 24px", lineHeight: 1.5 }}>
          opportunity.com saves your CV to a real account — no anonymous sessions — so tailoring and downloads need you signed in.
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/login" style={{ flex: 1, padding: "11px 0", borderRadius: 10, border: "1px solid rgba(32,21,21,0.24)", color: "#201515", textDecoration: "none", fontSize: 14, fontWeight: 600 }}>Sign in</Link>
          <Link href="/signup" style={{ flex: 1, padding: "11px 0", borderRadius: 10, border: "none", background: "#ff4f00", color: "#fffefb", textDecoration: "none", fontSize: 14, fontWeight: 700 }}>Create account</Link>
        </div>
        <button type="button" onClick={onClose} style={{ marginTop: 16, background: "none", border: "none", color: "#939084", fontSize: 13, cursor: "pointer" }}>Not now</button>
      </div>
    </div>
  );
}
