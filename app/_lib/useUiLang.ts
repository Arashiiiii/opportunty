"use client";
/**
 * Site-wide interface language (EN / FR / AR), shared by every page through
 * localStorage so a choice on the homepage follows the visitor into login,
 * the CV builder and checkout. Not to be confused with the CV's own content
 * language (the builder's FR/EN/ع toggle), which is a property of the CV.
 */
import { createContext, createElement, useCallback, useContext, useEffect, useSyncExternalStore } from "react";
import { DICT } from "../i18n";
import type { Lang } from "../i18n";
import { UI } from "./ui-dict";

/** Set by the /fr and /ar routes: the URL decides the language, also during server rendering. */
const LangOverride = createContext<Lang | null>(null);
export function LangProvider({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  return createElement(LangOverride.Provider, { value: lang }, children);
}

const KEY = "opportunity_lang_v1";
const listeners = new Set<() => void>();

function read(): Lang {
  try {
    const saved = localStorage.getItem(KEY) as Lang | null;
    if (saved && saved in DICT) return saved;
    const nav = (navigator.language || "en").slice(0, 2).toLowerCase();
    if (nav === "ar" || nav === "fr") return nav;
  } catch { /* storage unavailable */ }
  return "en";
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => { listeners.delete(cb); window.removeEventListener("storage", cb); };
}

export function useUiLang(): [Lang, (l: Lang) => void] {
  const forced = useContext(LangOverride);
  const stored = useSyncExternalStore(subscribe, read, () => (forced ?? "en") as Lang);
  const lang = forced ?? stored;
  const setLang = useCallback((l: Lang) => {
    try { localStorage.setItem(KEY, l); } catch { /* ignore */ }
    listeners.forEach((f) => f());
  }, []);
  // Arriving on /fr or /ar makes that the visitor's language for the rest of the site too.
  useEffect(() => {
    if (!forced) return;
    try { if (localStorage.getItem(KEY) !== forced) { localStorage.setItem(KEY, forced); listeners.forEach((f) => f()); } } catch { /* ignore */ }
  }, [forced]);
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);
  return [lang, setLang];
}

/** Dictionary for the non-homepage screens. */
export function useUI() {
  const [lang] = useUiLang();
  return { u: UI[lang], lang, rtl: lang === "ar" };
}
