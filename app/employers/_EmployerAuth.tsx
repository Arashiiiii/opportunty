"use client";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useUiLang } from "@/app/_lib/useUiLang";
import { UiLangSwitch } from "@/app/_components/UiLangSwitch";
import { EMP } from "./_dict";
import { isEmployer } from "./_role";
import { LogoMark } from "../_components/LogoMark";

const supabase = createClient();
const INK = "#201515";
const input: React.CSSProperties = { padding: "11px 14px", borderRadius: 10, border: "1px solid #e5ded3", fontSize: 14, fontFamily: "inherit", background: "#fff" };

function Form({ mode }: { mode: "login" | "signup" }) {
  const [lang] = useUiLang();
  const e = EMP[lang];
  const rtl = lang === "ar";
  const router = useRouter();
  const params = useSearchParams();
  const wrong = params.get("wrong") === "1";

  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(wrong ? e.wrongAccount : null);
  const [done, setDone] = useState(false);

  // Already signed in as an employer → straight to the dashboard.
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => { if (isEmployer(user)) router.replace("/dashboard/employer"); });
  }, [router]);

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setBusy(true); setError(null);
    if (mode === "signup") {
      const { data, error: err } = await supabase.auth.signUp({
        email, password,
        options: { data: { role: "employer", company_name: company.trim() }, emailRedirectTo: `${window.location.origin}/dashboard/employer` },
      });
      setBusy(false);
      if (err) { setError(err.message); return; }
      if (data.session) { router.push("/dashboard/employer"); router.refresh(); return; }
      setDone(true);
    } else {
      const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) { setBusy(false); setError(err.message); return; }
      if (!isEmployer(data.user)) {
        await supabase.auth.signOut();
        setBusy(false); setError(e.notEmployer); return;
      }
      setBusy(false);
      router.push("/dashboard/employer"); router.refresh();
    }
  };

  const title = mode === "login" ? e.loginTitle : e.signupTitle;
  const note = mode === "login" ? e.loginNote : e.signupNote;

  return (
    <div dir={rtl ? "rtl" : "ltr"} className="emp-auth" style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "minmax(0, 1fr)", background: "#fffefb", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ width: "100%", maxWidth: 400 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24, textDecoration: "none" }}>
            <LogoMark size={26} />
            <span style={{ fontSize: 15, fontWeight: 700, color: INK }}>opportunity<span style={{ color: "#ff4f00" }}>.com</span></span>
          </Link>
          <div style={{ marginBottom: 20 }}><UiLangSwitch compact /></div>

          <span style={{ display: "inline-block", fontSize: 12, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", background: INK, color: "#fffefb", borderRadius: 9999, padding: "4px 12px", marginBottom: 12 }}>{e.badge}</span>

          {done ? (
            <div style={{ padding: "16px 18px", borderRadius: 10, background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", fontSize: 13.5 }}>
              {e.checkInbox.split("{email}").flatMap((part, i, arr) => i < arr.length - 1 ? [part, <b key={i}>{email}</b>] : [part])}
            </div>
          ) : (
            <>
              <h1 style={{ fontSize: 24, fontWeight: 700, color: INK, margin: "0 0 6px" }}>{title}</h1>
              <p style={{ fontSize: 14, color: "#6b6259", margin: "0 0 18px" }}>{note}</p>

              {mode === "signup" && (
                <ul style={{ margin: "0 0 20px", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
                  {e.perks.map((p) => <li key={p} style={{ fontSize: 13.5, color: "#36342e" }}><span style={{ color: "#ff4f00", marginInlineEnd: 8 }}>✓</span>{p}</li>)}
                </ul>
              )}

              {error && <div style={{ padding: "10px 14px", borderRadius: 8, background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", fontSize: 13, marginBottom: 16 }}>⚠ {error}</div>}

              <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {mode === "signup" && <input required dir="auto" placeholder={e.company} value={company} onChange={(x) => setCompany(x.target.value)} style={input} />}
                <input type="email" required placeholder={e.workEmail} value={email} onChange={(x) => setEmail(x.target.value)} style={input} />
                <input type="password" required minLength={mode === "signup" ? 6 : undefined} placeholder={mode === "signup" ? e.passwordMin : e.password} value={password} onChange={(x) => setPassword(x.target.value)} style={input} />
                <button type="submit" disabled={busy} style={{ padding: "12px 14px", borderRadius: 10, border: "none", background: INK, color: "#fffefb", fontSize: 14, fontWeight: 700, cursor: busy ? "wait" : "pointer", fontFamily: "inherit", opacity: busy ? 0.7 : 1 }}>
                  {mode === "login" ? (busy ? e.signingIn : e.signIn) : (busy ? e.creating : e.createAccount)}
                </button>
              </form>
            </>
          )}

          <p style={{ fontSize: 13, color: "#6b6259", marginTop: 20, textAlign: "center" }}>
            {mode === "login"
              ? <>{e.noAccount} <Link href="/employers/signup" style={{ color: "#ff4f00", fontWeight: 600, textDecoration: "none" }}>{e.createOne}</Link></>
              : <>{e.haveAccount} <Link href="/employers/login" style={{ color: "#ff4f00", fontWeight: 600, textDecoration: "none" }}>{e.signIn}</Link></>}
          </p>
        </div>
      </div>
      <div className="emp-photo" aria-hidden="true" style={{ backgroundImage: "linear-gradient(to top, rgba(32,21,21,.55), rgba(32,21,21,0) 45%), url(/employers-hero.jpg)", backgroundSize: "cover", backgroundPosition: "75% center" }} />
      <style>{`
        .emp-photo{display:none}
        @media (min-width: 900px){
          .emp-auth{grid-template-columns:minmax(0,1fr) minmax(0,1fr) !important}
          .emp-photo{display:block;min-height:100vh}
        }
      `}</style>
    </div>
  );
}

export function EmployerAuth({ mode }: { mode: "login" | "signup" }) {
  return <Suspense fallback={null}><Form mode={mode} /></Suspense>;
}
