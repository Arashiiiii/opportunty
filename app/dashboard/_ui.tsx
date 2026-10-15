"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import { UiLangSwitch } from "@/app/_components/UiLangSwitch";
import { useUiLang } from "@/app/_lib/useUiLang";
import { DASH, type DashDict } from "./_dict";
import { LogoMark } from "../_components/LogoMark";

export const PRIMARY = "#ff4f00";
export const INK = "#201515";
export const MUTED = "#605d52";
export const LINE = "rgba(32,21,21,0.12)";

export function useDash() {
  const [lang] = useUiLang();
  return { d: DASH[lang], lang, rtl: lang === "ar" };
}

export function Shell({ active, title, sub, children }: { active: "seeker" | "employer"; title: string; sub: string; children: ReactNode }) {
  const { d, rtl } = useDash();
  const router = useRouter();
  return (
    <div dir={rtl ? "rtl" : "ltr"} style={{ minHeight: "100vh", background: "#fffefb", color: INK, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <header className="dash-head" style={{ position: "sticky", top: 0, zIndex: 10, background: "#fffefb", borderBottom: `1px solid ${LINE}`, height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", gap: 12 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 20, fontWeight: 700, letterSpacing: "-0.5px", color: INK, textDecoration: "none" }}><LogoMark size={28} /><span>opportunity<span style={{ color: PRIMARY }}>.</span></span></Link>
        <nav style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <UiLangSwitch compact />
          <Link href="/" className="dash-home" style={{ fontSize: 14, color: MUTED, textDecoration: "none", whiteSpace: "nowrap" }}>{d.home}</Link>
          <button type="button" onClick={async () => { await createClient().auth.signOut(); router.push("/"); router.refresh(); }}
            style={{ fontSize: 14, color: MUTED, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap", padding: 0 }}>{d.signOut}</button>
        </nav>
      </header>
      <style>{`@media (max-width: 560px){ .dash-head{padding:0 14px !important} .dash-head nav{gap:10px !important} .dash-home{display:none !important} .dash-main{padding:20px 14px 72px !important} }`}</style>
      <main className="dash-main" style={{ maxWidth: 1080, margin: "0 auto", padding: "28px 24px 96px" }}>
        <h1 style={{ margin: "0 0 6px", fontSize: "clamp(26px, 4vw, 36px)", fontWeight: 500, lineHeight: 1.1 }}>{title}</h1>
        <p style={{ margin: "0 0 24px", color: MUTED, fontSize: 16, maxWidth: 640, lineHeight: 1.5 }}>{sub}</p>
        {children}
      </main>
    </div>
  );
}

export function Kpis({ items }: { items: { label: string; value: string; note: string; color?: string }[] }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 150px), 1fr))", gap: 12, marginBottom: 16 }}>
      {items.map((k) => (
        <div key={k.label} style={{ border: `1px solid ${LINE}`, borderRadius: 12, padding: "16px 18px", background: "#fff" }}>
          <div style={{ fontSize: 13, color: MUTED, fontWeight: 600 }}>{k.label}</div>
          <div style={{ fontSize: 34, fontWeight: 500, letterSpacing: "-0.5px", margin: "4px 0 2px", color: k.color ?? INK, fontVariantNumeric: "tabular-nums" }}>{k.value}</div>
          <div style={{ fontSize: 12.5, color: "#939084" }}>{k.note}</div>
        </div>
      ))}
    </div>
  );
}

export function Card({ title, sub, children, style }: { title: string; sub?: string; children: ReactNode; style?: React.CSSProperties }) {
  return (
    <section style={{ border: `1px solid ${LINE}`, borderRadius: 12, padding: 20, background: "#fff", minWidth: 0, ...style }}>
      <h2 style={{ margin: 0, fontSize: 17, fontWeight: 600 }}>{title}</h2>
      {sub && <p style={{ margin: "2px 0 14px", fontSize: 13, color: "#939084" }}>{sub}</p>}
      {!sub && <div style={{ height: 14 }} />}
      {children}
    </section>
  );
}

export function Grid({ children }: { children: ReactNode }) {
  return <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 380px), 1fr))", gap: 16, marginBottom: 16 }}>{children}</div>;
}

/** Horizontal bars: label · bar · value. */
export function BarList({ rows, empty }: { rows: { label: string; value: number; hint?: string }[]; empty: string }) {
  if (!rows.length) return <div style={{ color: "#939084", fontSize: 14 }}>{empty}</div>;
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
      {rows.map((r) => (
        <div key={r.label} style={{ display: "grid", gridTemplateColumns: "minmax(80px, 38%) 1fr auto", alignItems: "center", gap: 10, fontSize: 14 }}>
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={r.label} dir="auto">{r.label}</span>
          <span style={{ height: 10, borderRadius: 5, background: "#f3eee8", overflow: "hidden", display: "block" }}>
            <span style={{ display: "block", height: "100%", width: `${(r.value / max) * 100}%`, background: PRIMARY, borderRadius: 5 }} />
          </span>
          <span style={{ fontVariantNumeric: "tabular-nums", fontWeight: 600, minWidth: 28, textAlign: "end" }}>{r.hint ?? r.value}</span>
        </div>
      ))}
    </div>
  );
}

/** Vertical columns with a few x labels. */
export function Columns({ values, labels, empty }: { values: number[]; labels: string[]; empty?: string }) {
  const max = Math.max(...values, 1);
  if (empty && values.every((v) => v === 0)) return <div style={{ color: "#939084", fontSize: 14 }}>{empty}</div>;
  const every = Math.max(1, Math.ceil(values.length / 6));
  return (
    <div dir="ltr">
      <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 150 }}>
        {values.map((v, i) => (
          <div key={i} title={`${labels[i]}: ${v}`} style={{ flex: 1, minWidth: 2, height: `${Math.max(v ? 4 : 1, (v / max) * 100)}%`, background: v ? PRIMARY : "rgba(32,21,21,0.08)", borderRadius: "3px 3px 0 0" }} />
        ))}
      </div>
      <div style={{ display: "flex", gap: 3, marginTop: 6, fontSize: 11, color: "#939084" }}>
        {labels.map((l, i) => <div key={i} style={{ flex: 1, minWidth: 2, overflow: "visible", whiteSpace: "nowrap", textAlign: "start" }}>{i % every === 0 ? l : ""}</div>)}
      </div>
    </div>
  );
}

export function Table({ head, rows, empty }: { head: string[]; rows: ReactNode[][]; empty: string }) {
  if (!rows.length) return <div style={{ color: "#939084", fontSize: 14 }}>{empty}</div>;
  const th: React.CSSProperties = { textAlign: "start", fontSize: 12, fontWeight: 600, color: "#939084", padding: "6px 10px", whiteSpace: "nowrap", borderBottom: `1px solid ${LINE}` };
  const td: React.CSSProperties = { padding: "10px", fontSize: 14, borderBottom: "1px solid rgba(32,21,21,0.06)", verticalAlign: "middle" };
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead><tr>{head.map((h) => <th key={h} style={th}>{h}</th>)}</tr></thead>
        <tbody>{rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j} style={td}>{c}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

export function Pill({ children, color = PRIMARY }: { children: ReactNode; color?: string }) {
  return <span style={{ display: "inline-block", padding: "2px 10px", borderRadius: 9999, fontSize: 12.5, fontWeight: 700, background: `${color}1a`, color }}>{children}</span>;
}

export function LinkBtn({ href, children, primary }: { href: string; children: ReactNode; primary?: boolean }) {
  return (
    <Link href={href} style={{ display: "inline-block", fontSize: 14, fontWeight: 700, padding: "10px 18px", borderRadius: 10, textDecoration: "none", background: primary ? PRIMARY : "#fffefb", color: primary ? "#fffefb" : INK, border: primary ? "none" : "1px solid rgba(32,21,21,0.24)" }}>{children}</Link>
  );
}

export type { DashDict };
