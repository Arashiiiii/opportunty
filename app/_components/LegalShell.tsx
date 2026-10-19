"use client";
import Link from "next/link";
import { UiLangSwitch } from "./UiLangSwitch";
import { SiteFooter } from "./SiteFooter";
import { useUiLang } from "../_lib/useUiLang";
import { LogoMark } from "./LogoMark";
import { Wordmark } from "./Wordmark";

/** Page chrome shared by the footer pages: slim header, content column, footer. */
export function PageShell({ children }: { children: React.ReactNode }) {
  const [lang] = useUiLang();
  return (
    <div dir={lang === "ar" ? "rtl" : "ltr"} style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#fffefb", color: "#201515", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <header style={{ height: 64, borderBottom: "1px solid rgba(32,21,21,0.12)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <LogoMark size={26} />
          <Wordmark tld style={{ fontSize: 15, fontWeight: 700 }} />
        </Link>
        <UiLangSwitch compact />
      </header>
      <main style={{ flex: 1, width: "100%", maxWidth: 760, margin: "0 auto", padding: "48px 24px 64px" }}>{children}</main>
      <SiteFooter />
    </div>
  );
}
