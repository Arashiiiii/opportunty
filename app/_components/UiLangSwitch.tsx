"use client";
import { usePathname, useRouter } from "next/navigation";
import { LANGS } from "../i18n";
import { useUiLang } from "../_lib/useUiLang";
import { localizedPath } from "../_lib/locale-routes";

export function UiLangSwitch({ compact = false }: { compact?: boolean }) {
  const [lang, setLang] = useUiLang();
  const pathname = usePathname();
  const router = useRouter();
  return (
    <div role="group" aria-label="Language" style={{ flex: "0 0 auto", display: "inline-flex", border: "1px solid rgba(32,21,21,0.15)", borderRadius: 9999, overflow: "hidden", background: "#fff" }}>
      {LANGS.map((l) => (
        <button key={l.code} type="button" aria-pressed={lang === l.code}
          onClick={() => {
            setLang(l.code);
            // Pages with their own /fr and /ar URL move to that URL, so the address always matches the language.
            const target = localizedPath(pathname, l.code);
            if (target && target !== pathname) router.push(target);
          }}
          style={{ padding: compact ? "4px 8px" : "6px 11px", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: compact ? 11 : 13, fontWeight: 700, background: lang === l.code ? "#201515" : "transparent", color: lang === l.code ? "#fffefb" : "#605d52" }}>
          {l.label}
        </button>
      ))}
    </div>
  );
}
