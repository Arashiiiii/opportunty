"use client";
import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useUI } from "@/app/_lib/useUiLang";
import { UiLangSwitch } from "@/app/_components/UiLangSwitch";
import { CodeAuth } from "@/app/_components/CodeAuth";
import { LogoMark } from "../_components/LogoMark";

export default function SignupPage() {
  const { u, rtl, lang } = useUI();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy]         = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [done, setDone]         = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { error: err } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { lang }, emailRedirectTo: typeof window !== "undefined" ? `${window.location.origin}/dashboard` : undefined },
    });
    setBusy(false);
    if (err) { setError(err.message); return; }
    setDone(true);
  };

  return (
    <div dir={rtl ? "rtl" : "ltr"} className="seek-auth" style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "minmax(0, 1fr)", background: "#fffefb", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 380 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 32, textDecoration: "none" }}>
          <LogoMark size={26} />
          <span style={{ fontSize: 15, fontWeight: 700, color: "#201515" }}>opportunity<span style={{ color: "#ff4f00" }}>.com</span></span>
        </Link>

        <div style={{ marginBottom: 20 }}><UiLangSwitch compact /></div>
        {done ? (
          <div style={{ padding: "16px 18px", borderRadius: 10, background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", fontSize: 13.5 }}>
            {u.checkInbox.split("{email}").flatMap((part, i, arr) => i < arr.length - 1 ? [part, <b key={i}>{email}</b>] : [part])}
          </div>
        ) : (
          <>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "#201515", margin: "0 0 6px" }}>{u.signupTitle}</h1>
            <p style={{ fontSize: 13, color: "#6b6259", margin: "0 0 24px" }}>
              {u.signupNote}
            </p>

            {error && (
              <div style={{ padding: "10px 14px", borderRadius: 8, background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", fontSize: 13, marginBottom: 16 }}>
                ⚠ {error}
              </div>
            )}

            <CodeAuth />
            <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input type="email" required placeholder={u.email} value={email} onChange={(e) => setEmail(e.target.value)}
                style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #e5ded3", fontSize: 14, fontFamily: "inherit" }} />
              <input type="password" required minLength={6} placeholder={u.passwordMin} value={password} onChange={(e) => setPassword(e.target.value)}
                style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #e5ded3", fontSize: 14, fontFamily: "inherit" }} />
              <button type="submit" disabled={busy}
                style={{ padding: "11px 14px", borderRadius: 10, border: "none", background: "#ff4f00", color: "#fff", fontSize: 14, fontWeight: 700, cursor: busy ? "wait" : "pointer", fontFamily: "inherit", opacity: busy ? 0.7 : 1 }}>
                {busy ? u.creatingAccount : u.createAccount}
              </button>
            </form>
          </>
        )}

        <p style={{ fontSize: 13, color: "#6b6259", marginTop: 20, textAlign: "center" }}>
          {u.haveAccount} <Link href="/login" style={{ color: "#ff4f00", fontWeight: 600, textDecoration: "none" }}>{u.signIn}</Link>
        </p>
      </div>
      </div>
      <div className="seek-photo" aria-hidden="true" style={{ backgroundImage: "linear-gradient(to top, rgba(32,21,21,.35), rgba(32,21,21,0) 40%), url(/seekers-hero.jpg)", backgroundSize: "cover", backgroundPosition: "50% 30%" }} />
      <style>{`
        .seek-photo{display:none}
        @media (min-width: 900px){
          .seek-auth{grid-template-columns:minmax(0,1fr) minmax(0,1fr) !important}
          .seek-photo{display:block;min-height:100vh}
        }
      `}</style>
    </div>
  );
}
