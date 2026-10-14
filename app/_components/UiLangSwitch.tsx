"use client";
import { LANGS } from "../i18n";
import { useUiLang } from "../_lib/useUiLang";

export function UiLangSwitch({ compact = false }: { compact?: boolean }) {
  const [lang, setLang] = useUiLang();
  return (
    <div role="group" aria-label="Language" style={{ flex: "0 0 auto", display: "inline-flex", border: "1px solid rgba(32,21,21,0.15)", borderRadius: 9999, overflow: "hidden", background: "#fff" }}>
      {LANGS.map((l) => (
        <button key={l.code} type="button" onClick={() => setLang(l.code)} aria-pressed={lang === l.code}
          style={{ padding: compact ? "4px 8px" : "6px 11px", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: compact ? 11 : 13, fontWeight: 700, background: lang === l.code ? "#201515" : "transparent", color: lang === l.code ? "#fffefb" : "#605d52" }}>
          {l.label}
        </button>
      ))}
    </div>
  );
}
