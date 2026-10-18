"use client";
/**
 * opportunity.com homepage — built from the approved design mockup
 * (Artifact 6eda429d…): search bar, job feed (left) + CV space (right),
 * CV template strip below.
 *
 * No login required to use the CV workspace: uploading a résumé, dragging
 * a job onto it, and picking a template all work signed out — the CV
 * lives in the browser (Zustand store, mirrored to localStorage) and
 * hands off into /cv/builder. opportunity.com only asks for a real
 * account at the one point that matters: downloading (Topbar), which is
 * also where a signed-in visitor is sent on to pay.
 *
 * "Tailoring" calls Claude (via /api/cv/tailor) to rewrite the title,
 * summary and a highlighted-skills group for the dropped job — falling
 * back to a deterministic tag-matching pass (cv/_lib/tailor.ts) if that
 * call fails, so dragging a job never just breaks.
 */
import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { TEMPLATE_REGISTRY, EMPTY_CV, CVDataSchema } from "./cv/_lib/schema";
import type { TemplateId, CVData } from "./cv/_lib/schema";
import { useCVStore } from "./cv/_store/cv-store";
import { tailorCVForJob } from "./cv/_lib/tailor";
import { markHandoff } from "./cv/_lib/handoff";
import { saveLocalDraft } from "./cv/_lib/local-draft";
import { saveReport, clearReport } from "./cv/_lib/tailor-report";
import type { TailorReport } from "./cv/_lib/tailor-report";
import { TemplateCarousel } from "./TemplateCarousel";
import { DICT } from "./i18n";
import type { CountryCode } from "./i18n";
import { useUiLang } from "./_lib/useUiLang";
import { UiLangSwitch } from "./_components/UiLangSwitch";
import { LoginGateModal } from "./_components/LoginGateModal";
import { TourPopup } from "./_components/TourPopup";
import { inferCountry } from "./_lib/country";
import { isEmployer } from "./employers/_role";
import { LogoMark } from "./_components/LogoMark";
import { SiteFooter } from "./_components/SiteFooter";

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
  logo_url?: string | null;
  external_url?: string | null;
  original_url?: string | null;
  created_at?: string | null;
}


/** "2 days ago" in the UI language; `fresh` = posted within the last 3 days. */
function postedInfo(iso: string | null | undefined, lang: string): { label: string; fresh: boolean } | null {
  const t = iso ? new Date(iso).getTime() : NaN;
  if (!Number.isFinite(t)) return null;
  const mins = Math.max(0, Math.round((Date.now() - t) / 60000));
  const rtf = new Intl.RelativeTimeFormat(lang, { numeric: "auto" });
  const label = mins < 60 ? rtf.format(-Math.max(1, mins), "minute")
    : mins < 1440 ? rtf.format(-Math.round(mins / 60), "hour")
    : mins < 43200 ? rtf.format(-Math.round(mins / 1440), "day")
    : rtf.format(-Math.round(mins / 43200), "month");
  return { label, fresh: mins < 3 * 1440 };
}

const applyUrl = (j: Job) => j.external_url || j.original_url || null;

/** A CV counts as "there" once it has a name, summary or any experience. */
function cvHasContent(cv: CVData | null | undefined): cv is CVData {
  if (!cv) return false;
  return !!(cv.profile.firstName || cv.profile.lastName || cv.summary.trim() || cv.experience.length);
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

const COUNTRIES: { code: CountryCode; flag: string }[] = [
  { code: "MA", flag: "🇲🇦" },
  { code: "FR", flag: "🇫🇷" },
  { code: "DE", flag: "🇩🇪" },
  { code: "BE", flag: "🇧🇪" },
  { code: "NL", flag: "🇳🇱" },
  { code: "SA", flag: "🇸🇦" },
];
const COUNTRY_KEY = "opportunity_country_v1";

/** "Casablanca, Morocco" / "Paris (75)" → "Casablanca" / "Paris" (null for remote/unknown). */
function cityOf(location: string | null | undefined): string | null {
  const c = (location ?? "").split(/[,(–—]|\s-\s/)[0].trim();
  if (!c || c.length > 40 || /^(anywhere|remote|télétravail|n\/a)$/i.test(c)) return null;
  return c;
}

export default function HomeClient() {
  const router = useRouter();
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [employer, setEmployer] = useState(false);
  const [country, setCountry] = useState<CountryCode>("MA");
  const [lang] = useUiLang();
  const [jobs, setJobs] = useState<Job[]>(PLACEHOLDER_JOBS);
  const [feedLoading, setFeedLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("");
  const [usingPlaceholders, setUsingPlaceholders] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detailsSeen, setDetailsSeen] = useState<Set<string>>(new Set());
  const [confirmJob, setConfirmJob] = useState<Job | null>(null);
  const [dragOver, setDragOver] = useState(false);
  // Phones/tablets have no mouse: dragging a card to a CV panel far below the fold is unusable, so touch gets a one-tap action.
  const [finePointer, setFinePointer] = useState(true);
  const [cvJobId, setCvJobId] = useState<string | null>(null);
  const [tailoring, setTailoring] = useState(false);
  const [tailoredCV, setTailoredCV] = useState<CVData | null>(null);
  const [templateId, setTemplateId] = useState<TemplateId | null>(null);
  const [showLoginGate, setShowLoginGate] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [homeCV, setHomeCV] = useState<CVData | null>(null);
  const [pendingJobId, setPendingJobId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => { setAuthed(!!user); setEmployer(isEmployer(user)); });

    // Only a CV uploaded/created during this visit counts. A leftover browser draft must not
    // silently skip the upload step when a job is dropped.
    const inMemory = useCVStore.getState().cv;
    if (cvHasContent(inMemory)) setHomeCV(inMemory);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    const sync = () => setFinePointer(mq.matches);
    sync();
    mq.addEventListener?.("change", sync);
    return () => mq.removeEventListener?.("change", sync);
  }, []);

  // Remembered country (client-only; first paint is Morocco to avoid hydration mismatch).
  useEffect(() => {
    try {
      const saved = localStorage.getItem(COUNTRY_KEY) as CountryCode | null;
      if (saved && COUNTRIES.some((c) => c.code === saved)) setCountry(saved);
    } catch { /* storage unavailable */ }
  }, []);

  // One country's feed at a time.
  useEffect(() => {
    let cancelled = false;
    setFeedLoading(true);
    const cols = "id, title, company, location, job_type, salary_range, tags, description, logo_url, external_url, original_url, created_at";
    (async () => {
      let rows: Job[] | null = null;
      const byCol = await supabase.from("jobs").select(cols).eq("is_active", true).eq("country", country)
        .order("created_at", { ascending: false }).limit(60);
      if (!byCol.error) {
        rows = (byCol.data ?? []) as Job[];
      } else {
        // `country` column not there yet → filter by guessed country instead.
        const all = await supabase.from("jobs").select(cols).eq("is_active", true)
          .order("created_at", { ascending: false }).limit(200);
        if (!all.error && all.data) rows = (all.data as Job[]).filter((j) => inferCountry(j.location) === country).slice(0, 60);
      }
      if (cancelled) return;
      if (rows && rows.length > 0) { setJobs(rows); setUsingPlaceholders(false); }
      else if (rows) { setJobs([]); setUsingPlaceholders(false); }
      else if (country === "MA") { setJobs(PLACEHOLDER_JOBS); setUsingPlaceholders(true); }
      else { setJobs([]); setUsingPlaceholders(false); }
      setExpandedId(null);
      setFeedLoading(false);
    })();
    return () => { cancelled = true; };
  }, [country]);

  const T = DICT[lang];
  const rtl = lang === "ar";
  const cName = (c: CountryCode) => T.countries[c].name;
  const cIn = T.countries[country].in;
  /** Fill {job}/{company} placeholders, bolding the job title. */
  const fill = (tpl: string, job: string, company: string): React.ReactNode =>
    tpl.split(/(\{job\})/).map((part, i) =>
      part === "{job}" ? <b key={i}>{job}</b> : part.replace("{company}", company));

  // Cities that actually have listings in this country's feed, most listings first.
  const cityOptions = (() => {
    const m = new Map<string, { label: string; n: number }>();
    for (const j of jobs) {
      const c = cityOf(j.location);
      if (!c) continue;
      const k = c.toLowerCase();
      const cur = m.get(k);
      if (cur) cur.n += 1; else m.set(k, { label: c, n: 1 });
    }
    return [...m.entries()].sort((a, b) => b[1].n - a[1].n || a[1].label.localeCompare(b[1].label)).map(([key, v]) => ({ key, ...v }));
  })();
  const activeCity = cityOptions.some((o) => o.key === city) ? city : "";

  const q = query.trim().toLowerCase();
  const visibleJobs = jobs.filter((j) =>
    (!activeCity || cityOf(j.location)?.toLowerCase() === activeCity) &&
    (!q || [j.title, j.company, j.location, ...(j.tags ?? [])].some((t) => t?.toLowerCase().includes(q))));

  const PAGE_SIZE = 10;
  const [page, setPage] = useState(1);
  useEffect(() => { setPage(1); }, [country, city, query]);
  const pageCount = Math.max(1, Math.ceil(visibleJobs.length / PAGE_SIZE));
  const curPage = Math.min(page, pageCount);
  const pagedJobs = visibleJobs.slice((curPage - 1) * PAGE_SIZE, curPage * PAGE_SIZE);
  const goPage = (n: number) => {
    setPage(n);
    document.querySelector(".opp-feed-top")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    document.querySelector<HTMLElement>('.opp-country-tabs [aria-selected="true"]')
      ?.scrollIntoView({ inline: "nearest", block: "nearest" });
  }, [country, lang]);

  const switchCountry = useCallback((c: CountryCode) => {
    setCountry(c);
    setCity("");
    try { localStorage.setItem(COUNTRY_KEY, c); } catch { /* ignore */ }
  }, []);

  const enterBuilder = useCallback((cv: CVData, template?: TemplateId) => {
    const store = useCVStore.getState();
    store.loadCV(cv);
    if (template) { store.setTemplate(template); }
    // Also persist to the local draft BEFORE navigating: on phones the route change can turn into a full page
    // load (slow/flaky network), which wipes the in-memory store — the builder then recovers from this draft.
    const s = useCVStore.getState();
    saveLocalDraft({ cv, template: s.template, accent: s.accent, lang: s.lang, order: s.order, enabled: s.enabled, cvName: s.cvName });
    clearReport(); // a report only belongs to the tailoring that sets it right after this call
    markHandoff();
    router.push("/cv/builder");
  }, [router]);

  /** Log the tailoring in the user's dashboard (signed-in + saved CV + real job only). */
  const recordTailoring = useCallback(async (cvId: string | undefined, jobId: string, out: CVData) => {
    if (!cvId || !/^[0-9a-f-]{36}$/i.test(jobId)) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from("cv_job_tailorings").insert({
        user_id: user.id, cv_id: cvId, job_id: jobId, status: "completed",
        tailored_data: out, completed_at: new Date().toISOString(),
      });
    } catch { /* dashboard logging is best-effort */ }
  }, []);

  const runTailor = useCallback(async (job: Job, base: CVData, save?: { cvId: string }) => {
    setCvJobId(job.id);
    setPendingJobId(null);
    setTailoredCV(null);
    setTailoring(true);
    let leaving = false;
    try {
      const res = await fetch("/api/cv/tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cv: base, job }),
      });
      const json = await res.json();
      const out = res.ok && json.cv ? (json.cv as CVData) : tailorCVForJob(base, job);
      setTailoredCV(out);
      await recordTailoring(save?.cvId, job.id, out);
      // Straight into the builder with the tailored CV, ready to edit or download.
      leaving = true;
      enterBuilder(out, templateId ?? undefined);
      if (res.ok && json.report) saveReport(json.report as TailorReport, base);
      return;
    } catch {
      setTailoredCV(tailorCVForJob(base, job));
    } finally {
      if (!leaving) setTailoring(false); // stay on the "tailoring…" state while the builder opens
    }
  }, [recordTailoring, enterBuilder, templateId]);

  /** Newest CV saved to the signed-in user's dashboard (null if signed out or none). */
  const loadSavedCV = useCallback(async (): Promise<{ cv: CVData; id: string } | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data } = await supabase.from("cvs").select("id, data")
      .eq("user_id", user.id).order("updated_at", { ascending: false }).limit(1).maybeSingle();
    if (!data) return null;
    const parsed = CVDataSchema.safeParse(data.data);
    if (!parsed.success || !cvHasContent(parsed.data)) return null;
    return { cv: parsed.data, id: data.id as string };
  }, []);

  /** Tailor `job` to the visitor's CV; asks for an upload first when there isn't one. */
  const startTailor = useCallback(async (job: Job) => {
    revealCvPanel();
    if (homeCV) { void runTailor(job, homeCV); return; }
    // No CV on this device: use the one saved in the user's dashboard…
    const saved = await loadSavedCV();
    if (saved) {
      setHomeCV(saved.cv);
      useCVStore.getState().loadCV(saved.cv);
      await runTailor(job, saved.cv, { cvId: saved.id });
      return;
    }
    // …otherwise ask for an upload first instead of tailoring a blank page.
    setPendingJobId(job.id);
    setUploadError(null);
    revealCvPanel();
  }, [homeCV, runTailor, loadSavedCV]);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const id = e.dataTransfer.getData("text/plain");
    const job = jobs.find((j) => j.id === id);
    if (job) await startTailor(job);
  }, [jobs, startTailor]);

  /** Apply: first click reveals the details; after that, nudge towards tailoring before leaving. */
  const handleApply = useCallback((job: Job) => {
    const url = applyUrl(job);
    if (!url) return;
    if (!detailsSeen.has(job.id)) {
      setDetailsSeen((s) => new Set(s).add(job.id));
      setExpandedId(job.id);
      return;
    }
    if (cvJobId === job.id) { window.open(url, "_blank", "noopener,noreferrer"); return; }
    setConfirmJob(job);
  }, [detailsSeen, cvJobId]);

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileSelected = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file) return;

    setUploadError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/cv/parse", { method: "POST", body: formData });
      const json = await res.json();
      if (!res.ok) {
        setUploadError(json.error ?? T.couldntRead);
        return;
      }
      const parsed = json.cv as CVData;
      useCVStore.getState().loadCV(parsed);
      setHomeCV(parsed);
      const pending = jobs.find((j) => j.id === pendingJobId);
      if (pending) await runTailor(pending, parsed);
    } catch {
      setUploadError(T.uploadFailed);
    } finally {
      setUploading(false);
    }
  }, [jobs, pendingJobId, runTailor, T]);

  const useSavedCV = useCallback(async () => {
    if (!authed) { setShowLoginGate(true); return; }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setShowLoginGate(true); return; }
    const { data } = await supabase
      .from("cvs")
      .select("id")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (data?.id) {
      router.push(`/cv/${data.id}`);
    } else {
      // No saved CV yet — anonymous builder is the right place to start one.
      enterBuilder(EMPTY_CV);
    }
  }, [authed, router, enterBuilder]);

  const cvJob = jobs.find((j) => j.id === cvJobId) ?? null;
  const pendingJob = jobs.find((j) => j.id === pendingJobId) ?? null;
  const showResult = !!cvJob && !tailoring && !!tailoredCV;
  const showEmpty = !cvJob && !tailoring;

  return (
    <div dir={rtl ? "rtl" : "ltr"} style={{ width: "100%", minHeight: "100vh", background: "#fffefb", display: "flex", flexDirection: "column", fontFamily: "'Inter', system-ui, -apple-system, sans-serif", color: "#201515" }}>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        onChange={handleFileSelected}
        style={{ display: "none" }}
      />

      {/* Header */}
      <header className="opp-topbar" style={{ position: "sticky", top: 0, zIndex: 20, background: "#fffefb", borderBottom: "1px solid rgba(32,21,21,0.12)", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 20, fontWeight: 700, letterSpacing: "-0.5px" }}><LogoMark size={28} /><span>opportunity<span style={{ color: PRIMARY }}>.</span></span></div>
        <nav style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <UiLangSwitch />
          <Link href={employer ? "/dashboard/employer" : "/employers/login"} className="opp-hide-mobile" style={{ fontSize: 16, textDecoration: "none", color: "#605d52" }}>{T.nav.employers}</Link>
          {authed ? (
            <>
              <Link href={employer ? "/dashboard/employer" : "/dashboard"} style={{ fontSize: 16, textDecoration: "none", color: "#605d52" }}>{T.nav.dashboard}</Link>
              {!employer && <Link href="/cv" className="opp-hide-mobile" style={{ fontSize: 16, textDecoration: "none", color: "#605d52" }}>{T.nav.myCVs}</Link>}
            </>
          ) : (
            <Link href="/login" style={{ fontSize: 16, textDecoration: "none", color: "#605d52" }}>{T.nav.signIn}</Link>
          )}
          <button type="button" onClick={() => router.push(employer ? "/dashboard/employer" : "/employers/signup")} className="opp-post-btn" style={{ fontSize: 14.4, fontWeight: 700, letterSpacing: "0.144px", padding: "12px 24px", borderRadius: 12, border: "none", background: PRIMARY, color: "#fffefb", cursor: "pointer", fontFamily: "inherit" }}>
            {T.nav.postJob}
          </button>
        </nav>
      </header>

      {/* Header band: slogan + search | CV template carousel */}
      <div className="opp-band" style={{ width: "100%", maxWidth: 1280, margin: "0 auto", padding: "20px 24px 12px", display: "grid", gridTemplateColumns: "minmax(320px, 1fr) minmax(380px, 1.15fr)", gap: 24, alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", color: PRIMARY, marginBottom: 8 }}>{T.eyebrow}</div>
          <h1 style={{ margin: "0 0 8px", fontSize: "clamp(28px, 4vw, 42px)", lineHeight: 1.05, fontWeight: 500 }}>{T.h1}</h1>
          <p style={{ margin: 0, fontSize: 16, lineHeight: 1.5, color: "#605d52", maxWidth: 480 }}>
            {T.sub}
          </p>
          {!homeCV && (
            <button type="button" onClick={handleUploadClick} disabled={uploading}
              style={{ marginTop: 16, display: "inline-flex", alignItems: "center", gap: 10, fontSize: 17, fontWeight: 700, padding: "14px 26px", borderRadius: 14, border: "none", background: PRIMARY, color: "#fff", cursor: uploading ? "wait" : "pointer", fontFamily: "inherit", opacity: uploading ? 0.75 : 1, boxShadow: "0 6px 18px rgba(255,79,0,0.28)" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 16V4M12 4l-5 5M12 4l5 5M4 20h16" /></svg>
              {uploading ? T.reading : T.uploadCV}
            </button>
          )}
        <div className="opp-search" style={{ width: "100%", maxWidth: 560, marginTop: 20, display: "flex", flexWrap: "wrap", alignItems: "center", background: "#f8f4f0", border: "1px solid rgba(32,21,21,0.12)", borderRadius: 12, padding: 6, gap: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flex: "1 1 100%", padding: "8px 12px", borderBottom: "1px solid rgba(32,21,21,0.08)", marginBottom: 2 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#939084" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            <input type="text" dir="auto" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={T.searchPlaceholder} style={{ border: "none", outline: "none", fontSize: 16, fontFamily: "inherit", width: "100%", color: "#201515", background: "transparent" }} />
          </div>
          <div className="opp-search-divider" style={{ display: "none", width: 1, height: 24, background: "rgba(32,21,21,0.12)" }} />
          <label style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", flex: "0 0 auto", cursor: "pointer" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#939084" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
            <select
              aria-label={T.countryLabel}
              value={country}
              onChange={(e) => switchCountry(e.target.value as CountryCode)}
              style={{ border: "none", outline: "none", background: "transparent", fontSize: 16, fontFamily: "inherit", color: "#201515", cursor: "pointer", appearance: "auto" }}
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>{c.flag} {cName(c.code)}</option>
              ))}
            </select>
          </label>
          <div className="opp-search-divider" style={{ width: 1, height: 24, background: "rgba(32,21,21,0.12)" }} />
          <label style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", flex: "0 0 auto", cursor: "pointer", minWidth: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#939084" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6" /></svg>
            <select
              aria-label={T.cityLabel}
              value={activeCity}
              onChange={(e) => setCity(e.target.value)}
              style={{ border: "none", outline: "none", background: "transparent", fontSize: 16, fontFamily: "inherit", color: "#201515", cursor: "pointer", appearance: "auto", maxWidth: 150 }}
            >
              <option value="">{T.allCities}</option>
              {cityOptions.map((o) => <option key={o.key} value={o.key}>{o.label} ({o.n})</option>)}
            </select>
          </label>
          <button type="button" className="opp-search-btn" style={{ flex: "1 1 auto", fontSize: 14.4, fontWeight: 700, letterSpacing: "0.144px", padding: "10px 18px", borderRadius: 6, border: "none", background: PRIMARY, color: "#fffefb", cursor: "pointer", whiteSpace: "nowrap", fontFamily: "inherit" }}>
            {T.search}
          </button>
        </div>
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div style={{ fontSize: 16, fontWeight: 600 }}>{T.pickTemplate}</div>
            <div style={{ fontSize: 13, color: "#605d52" }}>{T.templatesMeta}</div>
          </div>
        <TemplateCarousel
          compact
          labels={{ use: T.useTemplate + " " + T.arrow, prev: T.prevTemplate, next: T.nextTemplate }}
          templates={TEMPLATE_REGISTRY.map((t) => ({ id: t.id, name: t.name, sub: t.sub, accent: t.accent }))}
          onUse={(id) => {
            const tid = id as TemplateId;
            setTemplateId(tid);
            enterBuilder(useCVStore.getState().cv ?? EMPTY_CV, tid);
          }}
        />
        </div>
      </div>

      {/* Decorative photo strip */}
      <div className="opp-photo" aria-hidden="true" style={{ width: "calc(100% - 48px)", maxWidth: 1012, height: 220, margin: "4px auto 16px", borderRadius: 14, backgroundImage: "linear-gradient(90deg, rgba(32,21,21,.25), rgba(32,21,21,0) 40%), url(/employers-hero.jpg)", backgroundSize: "cover", backgroundPosition: "50% 40%", border: "1px solid rgba(32,21,21,0.12)" }} />

      {/* Two-column workspace */}
      <div className="opp-workspace" style={{ width: "100%", maxWidth: 1060, margin: "0 auto", padding: "4px 24px 96px", display: "grid", gridTemplateColumns: "minmax(300px, 1fr) minmax(340px, 1.1fr)", gap: 20, justifyContent: "center", alignItems: "start" }}>

        {/* Left: job feed */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div role="tablist" aria-label={T.countryLabel} className="opp-country-tabs" style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 2 }}>
            {COUNTRIES.map((c) => {
              const active = c.code === country;
              return (
                <button
                  key={c.code}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => switchCountry(c.code)}
                  style={{
                    flex: "0 0 auto", display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", borderRadius: 999,
                    border: active ? `1px solid ${PRIMARY}` : "1px solid rgba(32,21,21,0.12)",
                    background: active ? PRIMARY : "#f8f4f0", color: active ? "#fffefb" : "#201515",
                    fontSize: 14.4, fontWeight: 600, fontFamily: "inherit", cursor: "pointer", whiteSpace: "nowrap",
                  }}
                >
                  <span style={{ fontSize: 18, lineHeight: 1 }}>{c.flag}</span>{cName(c.code)}
                </button>
              );
            })}
          </div>

          <div className="opp-feed-top" style={{ fontSize: 14, color: "#605d52", scrollMarginTop: 80 }}>
            {feedLoading ? T.loading : T.rolesIn(visibleJobs.length, cIn)} · {finePointer ? T.dragHint : T.tapHint}
            {usingPlaceholders && <span style={{ color: "#c5a15a" }}> {T.sample}</span>}
          </div>

          {!feedLoading && visibleJobs.length === 0 && (
            <div style={{ background: "#f8f4f0", border: "1px dashed rgba(32,21,21,0.2)", borderRadius: 12, padding: 32, textAlign: "center", color: "#605d52", fontSize: 16 }}>
              {q ? T.noMatch(query.trim(), cIn) : T.noRoles(cIn)}
            </div>
          )}

          {pagedJobs.map((job) => {
            const isExpanded = expandedId === job.id;
            return (
              <div
                key={job.id}
                draggable={finePointer}
                onDragStart={(e) => {
                  e.dataTransfer.setData("text/plain", job.id);
                  e.dataTransfer.effectAllowed = "move";
                }}
                style={{ background: "#f8f4f0", border: "1px solid rgba(32,21,21,0.12)", borderRadius: 12, padding: 24, cursor: finePointer ? "grab" : "default" }}
              >
                <div className="opp-card-head" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                  <div className="opp-card-id" style={{ display: "flex", gap: 14, minWidth: 0 }}>
                    <CompanyLogo company={job.company} logoUrl={job.logo_url} />
                    <div style={{ minWidth: 0 }}>
                      <div dir="auto" style={{ fontSize: 24, lineHeight: "30px", fontWeight: 600, letterSpacing: "-0.6px", marginBottom: 4 }}>{job.title}</div>
                      <div dir="auto" style={{ fontSize: 16, lineHeight: "24px", color: "#605d52" }}>{job.company} · {job.location} · {job.job_type}</div>
                      {(() => { const pi = postedInfo(job.created_at, lang); return pi ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#605d52", marginTop: 2 }}>
                          {pi.fresh && <span style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: 0.3, textTransform: "uppercase", color: "#fff", background: PRIMARY, padding: "2px 8px", borderRadius: 9999 }}>{T.newBadge}</span>}
                          <span title={job.created_at ? new Date(job.created_at).toLocaleDateString(lang) : undefined}>{T.posted} {pi.label}</span>
                        </div>) : null; })()}
                    </div>
                  </div>
                  <div dir="ltr" style={{ fontSize: 14, fontWeight: 600, background: "#fffefb", border: "1px solid rgba(32,21,21,0.12)", borderRadius: 9999, padding: "4px 12px", whiteSpace: "nowrap", unicodeBidi: "isolate" }}>{job.salary_range}</div>
                </div>

                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 14 }}>
                  {job.tags.map((tag) => (
                    <span key={tag} style={{ fontSize: 14, color: "#605d52", border: "1px solid rgba(32,21,21,0.12)", borderRadius: 9999, padding: "3px 12px" }}>{tag}</span>
                  ))}
                </div>

                {isExpanded && (
                  <p style={{ fontSize: 16, lineHeight: "24px", color: "#36342e", margin: "14px 0 0", paddingTop: 14, borderTop: "1px solid rgba(32,21,21,0.12)" }}>{job.description}</p>
                )}

                <div className="opp-card-foot" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14, paddingTop: 14, borderTop: "1px solid rgba(32,21,21,0.12)" }}>
                  <button type="button" onClick={() => { setExpandedId(isExpanded ? null : job.id); if (!isExpanded) setDetailsSeen((s) => new Set(s).add(job.id)); }} style={{ fontSize: 14.4, fontWeight: 700, letterSpacing: "0.144px", background: "none", border: "none", padding: 0, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 2, fontFamily: "inherit" }}>
                    {isExpanded ? T.hideDetails : T.viewDetails}
                  </button>
                  <div className="opp-card-actions" style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
                    {applyUrl(job) ? (
                      <button type="button" onClick={() => handleApply(job)} className="opp-apply" style={{ fontSize: 14.4, fontWeight: 700, letterSpacing: "0.144px", padding: "9px 20px", borderRadius: 9999, border: "1.5px solid #201515", background: "#201515", color: "#fffefb", cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
                        {T.apply} ↗
                      </button>
                    ) : (
                      <span title={T.applySample} style={{ fontSize: 14.4, fontWeight: 700, padding: "9px 20px", borderRadius: 9999, border: "1.5px solid rgba(32,21,21,0.2)", color: "#a39c8f", whiteSpace: "nowrap", cursor: "not-allowed" }}>{T.apply}</span>
                    )}
                    <button type="button" className="opp-drag-pill" onClick={() => void startTailor(job)} title={finePointer ? T.dragTitle : T.tapTitle} style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 14.4, fontWeight: 800, letterSpacing: "0.2px", padding: "9px 16px 9px 12px", minHeight: 40, borderRadius: 9999, border: "none", background: "linear-gradient(135deg, #ff4f00, #ff8a3d)", color: "#fffefb", whiteSpace: "nowrap", userSelect: "none", fontFamily: "inherit", WebkitTapHighlightColor: "transparent" }}>
                      <svg className="opp-grip" width="14" height="16" viewBox="0 0 14 18" fill="#fffefb"><circle cx="4" cy="3" r="1.6" /><circle cx="10" cy="3" r="1.6" /><circle cx="4" cy="9" r="1.6" /><circle cx="10" cy="9" r="1.6" /><circle cx="4" cy="15" r="1.6" /><circle cx="10" cy="15" r="1.6" /></svg>
                      {finePointer ? T.dragToCV : T.tapToCV}
                      <span className="opp-drag-arrow" aria-hidden>{T.arrow}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {pageCount > 1 && (() => {
            const nums: (number | "…")[] = [];
            for (let n = 1; n <= pageCount; n++) {
              if (n === 1 || n === pageCount || Math.abs(n - curPage) <= 1) nums.push(n);
              else if (nums[nums.length - 1] !== "…") nums.push("…");
            }
            const btn = (active: boolean, disabled = false): React.CSSProperties => ({ minWidth: 40, height: 40, padding: "0 12px", borderRadius: 10, border: active ? "1.5px solid #201515" : "1px solid rgba(32,21,21,0.2)", background: active ? "#201515" : "#fffefb", color: active ? "#fffefb" : "#201515", fontWeight: 700, fontSize: 14.4, fontFamily: "inherit", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.4 : 1 });
            return (
              <nav aria-label={T.pageOf(curPage, pageCount)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, marginTop: 4 }}>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" }} dir="ltr">
                  <button type="button" disabled={curPage === 1} onClick={() => goPage(curPage - 1)} style={btn(false, curPage === 1)}>‹ {T.prev}</button>
                  {nums.map((n, i) => n === "…"
                    ? <span key={`e${i}`} style={{ alignSelf: "center", color: "#939084" }}>…</span>
                    : <button key={n} type="button" aria-current={n === curPage ? "page" : undefined} onClick={() => goPage(n)} style={btn(n === curPage)}>{n}</button>)}
                  <button type="button" disabled={curPage === pageCount} onClick={() => goPage(curPage + 1)} style={btn(false, curPage === pageCount)}>{T.next} ›</button>
                </div>
                <div style={{ fontSize: 13, color: "#939084" }}>{T.pageOf(curPage, pageCount)}</div>
              </nav>
            );
          })()}
        </div>

        {/* Right: CV space */}
        <div className="opp-cv-panel" style={{ position: "sticky", top: 88 }}>
          <div style={{ background: "#f8f4f0", border: "1px solid rgba(32,21,21,0.12)", borderRadius: 12, padding: 24 }}>
            <div style={{ fontSize: 20, lineHeight: "25px", fontWeight: 700, letterSpacing: "-0.5px", marginBottom: 4 }}>{T.yourCV}</div>
            <p style={{ fontSize: 16, lineHeight: "24px", color: "#605d52", margin: "0 0 24px" }}>{finePointer ? T.panelIntro : T.panelIntroTap}</p>

            {uploadError && (
              <div style={{ marginBottom: 16, padding: "10px 14px", borderRadius: 10, background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", fontSize: 13.5, display: "flex", justifyContent: "space-between", gap: 10 }}>
                <span>⚠ {uploadError}</span>
                <button type="button" onClick={() => setUploadError(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#991b1b", fontSize: 15 }}>×</button>
              </div>
            )}

            {showEmpty && !homeCV && (
              <div
                onDragOver={(e) => { e.preventDefault(); if (!dragOver) setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                style={{ border: `2px dashed ${pendingJob || dragOver ? PRIMARY : "rgba(32,21,21,0.24)"}`, borderRadius: 12, padding: "40px 24px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 14, transition: "border-color 120ms", background: "#fffefb" }}
              >
                {pendingJob ? (
                  <div style={{ background: "#fff1e8", border: "1px solid #ffcbab", borderRadius: 10, padding: "10px 14px", fontSize: 14.5, color: "#8a3a10", lineHeight: 1.45 }}>
                    {fill(T.pending, pendingJob.title, pendingJob.company)}
                  </div>
                ) : (
                  <div style={{ fontSize: 16, color: "#605d52", maxWidth: 300 }}>{finePointer ? T.startWithCV : T.startWithCVTap}</div>
                )}
                <button type="button" onClick={handleUploadClick} disabled={uploading} style={{ width: "100%", maxWidth: 260, fontSize: 15, fontWeight: 700, padding: "13px 24px", borderRadius: 12, border: "none", background: PRIMARY, color: "#fffefb", cursor: uploading ? "wait" : "pointer", fontFamily: "inherit", opacity: uploading ? 0.7 : 1 }}>
                  {uploading ? T.reading : T.uploadCV}
                </button>
                <div style={{ fontSize: 13, color: "#939084" }}>{T.pdfDocx}</div>
                <button type="button" onClick={() => enterBuilder(EMPTY_CV)} style={{ width: "100%", maxWidth: 260, fontSize: 14.4, fontWeight: 700, padding: "12px 24px", borderRadius: 12, border: "1px solid rgba(32,21,21,0.24)", background: "#fffefb", color: "#201515", cursor: "pointer", fontFamily: "inherit" }}>
                  {T.createScratch}
                </button>
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); useSavedCV(); }}
                  style={{ fontSize: 14, color: "#605d52", textDecoration: "underline", textUnderlineOffset: 2 }}
                >
                  {T.useSaved}
                </a>
              </div>
            )}

            {showEmpty && homeCV && (
              <div
                onDragOver={(e) => { e.preventDefault(); if (!dragOver) setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                style={{ border: `2px dashed ${dragOver ? PRIMARY : "rgba(32,21,21,0.24)"}`, borderRadius: 12, padding: "32px 24px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 12, transition: "border-color 120ms", background: dragOver ? "#fff1e8" : "#fffefb" }}
              >
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#e8f7ee", color: "#166534", fontSize: 13.5, fontWeight: 700, borderRadius: 9999, padding: "4px 12px" }}>{T.cvReady}</div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>
                  {`${homeCV.profile.firstName} ${homeCV.profile.lastName}`.trim() || T.cvFallback}
                </div>
                {homeCV.profile.title && <div style={{ fontSize: 14.5, color: "#605d52", marginTop: -6 }}>{homeCV.profile.title}</div>}
                <div style={{ fontSize: 16, color: PRIMARY, fontWeight: 700 }}>{dragOver ? T.dropIt : `${finePointer ? T.nowDrag : T.nowTap} ${T.arrow}`}</div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
                  <button type="button" onClick={() => enterBuilder(homeCV, templateId ?? undefined)} style={{ fontSize: 14.4, fontWeight: 700, padding: "10px 18px", borderRadius: 10, border: "none", background: "#201515", color: "#fffefb", cursor: "pointer", fontFamily: "inherit" }}>{T.openBuilder}</button>
                  <button type="button" onClick={handleUploadClick} disabled={uploading} style={{ fontSize: 14.4, fontWeight: 700, padding: "10px 18px", borderRadius: 10, border: "1px solid rgba(32,21,21,0.24)", background: "#fffefb", color: "#201515", cursor: uploading ? "wait" : "pointer", fontFamily: "inherit" }}>{uploading ? T.readingShort : T.replaceCV}</button>
                </div>
              </div>
            )}

            {tailoring && (
              <div style={{ border: "1px solid rgba(32,21,21,0.12)", borderRadius: 12, padding: "40px 24px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 14, background: "#fffefb" }}>
                <div style={{ width: 32, height: 32, borderRadius: 9999, border: "3px solid rgba(32,21,21,0.12)", borderTopColor: PRIMARY, animation: "spin 0.8s linear infinite" }} />
                <div style={{ fontSize: 16, color: "#36342e" }}>{fill(T.tailoring, cvJob?.title ?? "", cvJob?.company ?? "")}</div>
              </div>
            )}

            {showResult && cvJob && tailoredCV && (
              <div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: PRIMARY, color: "#fffefb", fontSize: 14, fontWeight: 600, borderRadius: 9999, padding: "5px 14px", marginBottom: 16 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fffefb" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  {T.tailoredFor.replace("{job}", cvJob.title)}
                </div>

                <div style={{ border: "1px solid rgba(32,21,21,0.12)", borderRadius: 12, padding: 20, background: "#fffefb" }}>
                  <div style={{ fontSize: 20, lineHeight: "25px", fontWeight: 700, letterSpacing: "-0.5px" }}>
                    {tailoredCV.profile.firstName || tailoredCV.profile.lastName
                      ? `${tailoredCV.profile.firstName} ${tailoredCV.profile.lastName}`.trim()
                      : T.nameFallback}
                  </div>
                  <div style={{ fontSize: 16, lineHeight: "24px", color: "#605d52", marginBottom: 16 }}>{cvJob.title} · {cvJob.location}</div>
                  <p style={{ fontSize: 16, lineHeight: "24px", color: "#36342e", margin: "0 0 16px" }}>
                    {tailoredCV.summary}
                  </p>

                  <div style={{ fontSize: 14, fontWeight: 600, color: "#605d52", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>{T.keyMatches}</div>
                  {cvJob.tags.map((tag) => (
                    <div key={tag} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 16, color: "#36342e", marginBottom: 6 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={PRIMARY} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                      {tag}
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                  <button
                    type="button"
                    onClick={() => enterBuilder(tailoredCV, templateId ?? undefined)}
                    style={{ flexGrow: 1, fontSize: 18, lineHeight: "27px", fontWeight: 600, padding: 12, borderRadius: 12, border: "none", background: PRIMARY, color: "#fffefb", cursor: "pointer", fontFamily: "inherit" }}
                  >
                    {T.continueBuilder}
                  </button>
                  <button type="button" onClick={() => { setCvJobId(null); setTailoring(false); setTailoredCV(null); setDragOver(false); }} style={{ fontSize: 14.4, fontWeight: 700, letterSpacing: "0.144px", padding: "12px 16px", borderRadius: 12, border: "1px solid rgba(32,21,21,0.24)", background: "#fffefb", color: "#201515", cursor: "pointer", fontFamily: "inherit" }}>
                    {T.startOver}
                  </button>
                </div>
                <p style={{ fontSize: 14, color: "#c5c0b1", margin: "12px 0 0" }}>{T.freeToEdit}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {confirmJob && (
        <div role="dialog" aria-modal="true" onClick={(e) => { if (e.target === e.currentTarget) setConfirmJob(null); }}
          style={{ position: "fixed", inset: 0, zIndex: 9000, background: "rgba(32,21,21,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: "#fffefb", borderRadius: 16, maxWidth: 440, width: "100%", padding: 28, boxShadow: "0 24px 64px rgba(0,0,0,.25)" }}>
            <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.4px", marginBottom: 8 }}>{T.confirmTitle}</div>
            <p style={{ fontSize: 15.5, lineHeight: 1.5, color: "#36342e", margin: "0 0 22px" }}>{fill(T.confirmMsg, confirmJob.title, confirmJob.company)}</p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button type="button" onClick={() => { const j = confirmJob; setConfirmJob(null); void startTailor(j); }}
                style={{ flex: "1 1 180px", fontSize: 14.4, fontWeight: 700, padding: "12px 18px", borderRadius: 12, border: "none", background: PRIMARY, color: "#fffefb", cursor: "pointer", fontFamily: "inherit" }}>{T.tailorFirst}</button>
              <button type="button" onClick={() => { const url = applyUrl(confirmJob); setConfirmJob(null); if (url) window.open(url, "_blank", "noopener,noreferrer"); }}
                style={{ flex: "1 1 140px", fontSize: 14.4, fontWeight: 700, padding: "12px 18px", borderRadius: 12, border: "1px solid rgba(32,21,21,0.24)", background: "#fffefb", color: "#201515", cursor: "pointer", fontFamily: "inherit" }}>{T.applyAnyway} ↗</button>
            </div>
          </div>
        </div>
      )}
      <TourPopup />
      {showLoginGate && <LoginGateModal onClose={() => setShowLoginGate(false)} />}

      <SiteFooter />

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes oppNudge { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(5px); } }
        @keyframes oppGlow { 0%, 100% { box-shadow: 0 0 0 0 rgba(255,79,0,0.45); } 60% { box-shadow: 0 0 0 9px rgba(255,79,0,0); } }
        .opp-drag-pill { cursor: pointer; animation: oppGlow 2.2s ease-out infinite; transition: transform 140ms; }
        .opp-drag-pill:hover { transform: translateY(-2px) rotate(-2deg) scale(1.04); }
        .opp-drag-arrow { display: inline-block; animation: oppNudge 1.1s ease-in-out infinite; }
        @media (pointer: coarse) { .opp-grip { display: none; } .opp-drag-pill { animation: none; } .opp-apply { min-height: 40px; } }
        .opp-apply { transition: transform 140ms, background 140ms; }
        .opp-apply:hover { transform: translateY(-1px); background: #ff4f00 !important; border-color: #ff4f00 !important; }

        .opp-band > div, .opp-workspace > div { min-width: 0; }
        .opp-cv-panel { scroll-margin-top: 84px; }
        .opp-tpl-card { transition: transform .15s ease; }
        .opp-tpl-card:hover { transform: translateY(-3px); }
        .opp-tpl-fade { animation: oppFade .25s ease; }
        @keyframes oppFade { from { opacity: .4 } to { opacity: 1 } }
        @media (max-width: 900px) {
          .opp-tpl-showcase { grid-template-columns: 1fr !important; }
          .opp-tpl-showcase > div:first-child { max-width: 320px; margin: 0 auto; width: 100%; }
          .opp-tpl-grid { grid-template-columns: repeat(5, 1fr) !important; }
          .opp-workspace { grid-template-columns: minmax(0, 1fr) !important; }
          .opp-band { grid-template-columns: minmax(0, 1fr) !important; }
          .opp-cv-panel  { position: static !important; top: auto !important; }
        }

        @media (max-width: 640px) {
          .opp-band        { padding: 16px 16px 8px !important; }
          .opp-workspace   { padding: 8px 16px 24px !important; gap: 20px !important; }
          .opp-hide-mobile { display: none !important; }
          .opp-photo { height: 120px !important; width: calc(100% - 32px) !important; }
          .opp-post-btn { display: none !important; }
          .opp-topbar { padding: 0 16px !important; }
          .opp-topbar nav { gap: 10px !important; }
          .opp-topbar nav a { white-space: nowrap; font-size: 14px !important; }
          .opp-tpl-grid { grid-template-columns: repeat(3, 1fr) !important; }
          .opp-post-btn    { padding: 10px 16px !important; font-size: 13px !important; }
          .opp-header      { padding: 0 16px !important; }
          .opp-search      { flex-direction: column; align-items: stretch !important; padding: 10px !important; gap: 8px; }
          .opp-search-divider { display: none !important; }
          .opp-search-btn  { width: 100%; padding: 13px 0 !important; }
          .opp-card-head   { flex-wrap: wrap; }
          .opp-card-id     { flex: 1 1 100%; }
          .opp-card-id > div:last-child { flex: 1 1 0; min-width: 0; }
          .opp-card-foot   { flex-direction: column; align-items: stretch !important; gap: 12px; }
          .opp-card-foot > button { align-self: flex-start; }
          .opp-card-actions { width: 100%; flex-wrap: nowrap !important; }
          .opp-card-actions > * { flex: 1 1 0; justify-content: center; text-align: center; }
        }
      `}</style>
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

/** On the stacked (phone/tablet) layout the CV panel sits below the job list: bring it into view. */
function revealCvPanel() {
  if (typeof window === "undefined" || !window.matchMedia("(max-width: 900px)").matches) return;
  requestAnimationFrame(() => document.querySelector(".opp-cv-panel")?.scrollIntoView({ behavior: "smooth", block: "start" }));
}

const LOGO_COLORS = ["#ff4f00", "#0f766e", "#7c3aed", "#be123c", "#1d4ed8", "#b45309", "#047857", "#9333ea"];

/** Company logo from the listing, falling back to a branded initials tile. */
function CompanyLogo({ company, logoUrl }: { company: string; logoUrl?: string | null }) {
  const [failed, setFailed] = useState(false);
  const size = 48;
  if (logoUrl && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logoUrl}
        alt={`${company} logo`}
        width={size}
        height={size}
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        style={{ width: size, height: size, borderRadius: 10, objectFit: "contain", background: "#fffefb", border: "1px solid rgba(32,21,21,0.12)", flexShrink: 0 }}
      />
    );
  }
  let h = 0;
  for (const ch of company) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const color = LOGO_COLORS[h % LOGO_COLORS.length];
  const initials = company.replace(/[^A-Za-zÀ-ÿ0-9 ]/g, "").split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "?";
  return (
    <div aria-hidden style={{ width: size, height: size, borderRadius: 10, background: color, color: "#fffefb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, fontWeight: 800, letterSpacing: 0.5, flexShrink: 0 }}>
      {initials}
    </div>
  );
}
