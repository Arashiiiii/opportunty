"use client";
import Link from "next/link";
import { useUiLang } from "../_lib/useUiLang";
import { FOOTER } from "../_lib/legal-dict";
import { COMPANY } from "../_lib/company";
import { LogoMark } from "./LogoMark";

const INK = "#0e1a21";
const col: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 10, minWidth: 140 };
const head: React.CSSProperties = { fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "#8f867c", marginBottom: 2 };
const link: React.CSSProperties = { fontSize: 14, color: "#e9e3da", textDecoration: "none" };

export function SiteFooter() {
  const [lang] = useUiLang();
  const f = FOOTER[lang];
  return (
    <footer dir={lang === "ar" ? "rtl" : "ltr"} style={{ borderTop: "3px solid #0079a8", background: INK, fontFamily: "'Inter Variable', 'Inter', system-ui, sans-serif", color: "#ffffff" }}>
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "40px 24px 24px", display: "flex", flexWrap: "wrap", gap: "32px 56px", justifyContent: "space-between" }}>
        <div style={{ maxWidth: 300, flex: "1 1 220px" }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <LogoMark size={24} />
            <span style={{ fontSize: 15, fontWeight: 700, color: "#ffffff" }}>opportunty<span style={{ color: "#0079a8" }}>.com</span></span>
          </Link>
          <p style={{ fontSize: 14, color: "#b9b0a5", lineHeight: 1.5, margin: "12px 0 0" }}>{f.tagline}</p>
          <div style={{ display: "flex", gap: 14, marginTop: 12, fontSize: 14 }}>
            <a href="/" hrefLang="en" lang="en" style={link}>English</a>
            <a href="/fr" hrefLang="fr" lang="fr" style={link}>Français</a>
            <a href="/ar" hrefLang="ar" lang="ar" style={link}>العربية</a>
          </div>
        </div>
        <nav aria-label={f.product} style={col}>
          <div style={head}>{f.product}</div>
          <Link href="/jobs" style={link}>{f.jobs}</Link>
          <Link href="/jobs/country/morocco" style={link}>Morocco</Link>
          <Link href="/jobs/country/france" style={link}>France</Link>
          <Link href="/jobs/country/saudi-arabia" style={link}>Saudi Arabia</Link>
          <Link href={lang === "fr" ? "/fr/createur-de-cv-gratuit" : lang === "ar" ? "/ar/free-cv-builder" : "/free-cv-builder"} style={link}>{f.cvBuilder}</Link>
          {lang === "fr" && (<>
            <Link href="/fr/emploi" style={link}>Emploi par ville</Link>
            <Link href="/fr/modele-cv" style={link}>Exemples de CV</Link>
            <Link href="/fr/lettre-de-motivation" style={link}>Lettre de motivation</Link>
          </>)}
          <Link href="/employers/login" style={link}>{f.employers}</Link>
        </nav>
        <nav aria-label={f.company} style={col}>
          <div style={head}>{f.company}</div>
          <Link href="/about" style={link}>{f.about}</Link>
          <Link href="/contact" style={link}>{f.contact}</Link>
          <a href={`mailto:${COMPANY.contactEmail}`} style={link}>{COMPANY.contactEmail}</a>
        </nav>
        <nav aria-label={f.legal} style={col}>
          <div style={head}>{f.legal}</div>
          <Link href="/terms" style={link}>{f.terms}</Link>
          <Link href="/privacy" style={link}>{f.privacy}</Link>
          <Link href="/cookies" style={link}>{f.cookies}</Link>
          <Link href="/legal" style={link}>{f.notice}</Link>
        </nav>
      </div>
      <div style={{ borderTop: "1px solid rgba(255,254,251,0.12)" }}>
        <div style={{ maxWidth: 1060, margin: "0 auto", padding: "14px 24px", display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 8, fontSize: 13, color: "#b9b0a5" }}>
          <span>© {new Date().getFullYear()} {COMPANY.brand}. {f.rights}</span>
          <span>{f.made}</span>
        </div>
      </div>
    </footer>
  );
}
