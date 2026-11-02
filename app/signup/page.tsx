"use client";
import Link from "next/link";
import { useUI } from "@/app/_lib/useUiLang";
import { UiLangSwitch } from "@/app/_components/UiLangSwitch";
import { CodeAuth } from "@/app/_components/CodeAuth";
import { LogoMark } from "../_components/LogoMark";

export default function SignupPage() {
  const { u, rtl } = useUI();
  return (
    <div dir={rtl ? "rtl" : "ltr"} className="seek-auth" style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "minmax(0, 1fr)", background: "#ffffff", fontFamily: "'Inter Variable', 'Inter', system-ui, sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 380 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 32, textDecoration: "none" }}>
          <LogoMark size={26} />
          <span style={{ fontSize: 15, fontWeight: 700, color: "#0e1a21" }}>opportunty<span style={{ color: "#0079a8" }}>.com</span></span>
        </Link>

        <div style={{ marginBottom: 20 }}><UiLangSwitch compact /></div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0e1a21", margin: "0 0 6px" }}>{u.signupTitle}</h1>
        <p style={{ fontSize: 13, color: "#4a5b66", margin: "0 0 24px" }}>
          {u.signupNote}
        </p>
        <CodeAuth />

        <p style={{ fontSize: 13, color: "#4a5b66", marginTop: 20, textAlign: "center" }}>
          {u.haveAccount} <Link href="/login" style={{ color: "#0079a8", fontWeight: 600, textDecoration: "none" }}>{u.signIn}</Link>
        </p>
      </div>
      </div>
      <div className="seek-photo" aria-hidden="true" style={{ backgroundImage: "linear-gradient(to top, rgba(14,26,33,.35), rgba(14,26,33,0) 40%), url(/seekers-hero.jpg)", backgroundSize: "cover", backgroundPosition: "50% 30%" }} />
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
