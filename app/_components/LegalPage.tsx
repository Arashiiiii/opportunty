"use client";
import { PageShell } from "./LegalShell";
import { useUiLang } from "../_lib/useUiLang";
import { LEGAL, LAST_UPDATED, UPDATED_LABEL, type LegalSlug } from "../_lib/legal-dict";

export function LegalPage({ slug }: { slug: LegalSlug }) {
  const [lang] = useUiLang();
  const d = LEGAL[slug][lang];
  return (
    <PageShell>
      <h1 style={{ fontSize: "clamp(28px, 4vw, 38px)", fontWeight: 600, margin: "0 0 10px", lineHeight: 1.15 }}>{d.title}</h1>
      <p style={{ fontSize: 16, color: "#605d52", lineHeight: 1.6, margin: "0 0 6px" }}>{d.intro}</p>
      {slug !== "about" && <p style={{ fontSize: 13, color: "#939084", margin: "0 0 28px" }}>{UPDATED_LABEL[lang]}: {LAST_UPDATED}</p>}
      {slug === "about" && <div style={{ height: 22 }} />}
      {d.sections.map((s) => (
        <section key={s.h} style={{ marginBottom: 26 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 8px" }}>{s.h}</h2>
          {s.p.map((t, i) => <p key={i} style={{ fontSize: 15, lineHeight: 1.7, color: "#36342e", margin: "0 0 10px", whiteSpace: "pre-line" }}>{t}</p>)}
        </section>
      ))}
    </PageShell>
  );
}
