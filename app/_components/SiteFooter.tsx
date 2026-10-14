"use client";
import Link from "next/link";
import { useUiLang } from "../_lib/useUiLang";
import { FOOTER } from "../_lib/legal-dict";
import { COMPANY } from "../_lib/company";

const INK = "#201515";
const col: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 10, minWidth: 140 };
const head: React.CSSProperties = { fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "#939084", marginBottom: 2 };
const link: React.CSSProperties = { fontSize: 14, color: "#36342e", textDecoration: "none" };

export function SiteFooter() {
  const [lang] = useUiLang();
  const f = FOOTER[lang];
  return (
    <footer dir={lang === "ar" ? "rtl" : "ltr"} style={{ borderTop: "1px solid rgba(32,21,21,0.12)", background: "#f8f4f0", fontFamily: "'Inter', system-ui, sans-serif", color: INK }}>
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "40px 24px 24px", display: "flex", flexWrap: "wrap", gap: "32px 56px", justifyContent: "space-between" }}>
        <div style={{ maxWidth: 300, flex: "1 1 220px" }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: "linear-gradient(135deg, #ff4f00 0%, #ff4f00 50%, #201515 50%, #201515 100%)" }} />
            <span style={{ fontSize: 15, fontWeight: 700, color: INK }}>opportunity<span style={{ color: "#ff4f00" }}>.com</span></span>
          </Link>
          <p style={{ fontSize: 14, color: "#605d52", lineHeight: 1.5, margin: "12px 0 0" }}>{f.tagline}</p>
        </div>
        <nav aria-label={f.product} style={col}>
          <div style={head}>{f.product}</div>
          <Link href="/" style={link}>{f.jobs}</Link>
          <Link href="/cv" style={link}>{f.cvBuilder}</Link>
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
      <div style={{ borderTop: "1px solid rgba(32,21,21,0.08)" }}>
        <div style={{ maxWidth: 1060, margin: "0 auto", padding: "14px 24px", display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 8, fontSize: 13, color: "#605d52" }}>
          <span>© {new Date().getFullYear()} {COMPANY.brand}. {f.rights}</span>
          <span>{f.made}</span>
        </div>
      </div>
    </footer>
  );
}
