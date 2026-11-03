"use client";
/**
 * Cloudflare Turnstile (CAPTCHA) for the auth forms. Active only when NEXT_PUBLIC_TURNSTILE_SITE_KEY is set, so the
 * code can ship before the keys exist. When Supabase Auth's CAPTCHA protection is on, every sign-in / sign-up /
 * email-link request must carry the token (`options.captchaToken`).
 *
 * Usage:  const cap = useTurnstile();  …  {cap.widget}  …  pass cap.token; after each attempt call cap.reset().
 * `cap.enabled && !cap.token` means "still verifying" — callers should not submit yet.
 */
import { useCallback, useEffect, useRef, useState } from "react";

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

type TS = { render: (el: HTMLElement, o: Record<string, unknown>) => string; reset: (id?: string) => void; remove: (id?: string) => void };
declare global { interface Window { turnstile?: TS; __tsLoad?: Promise<void> } }

function loadScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  if (!window.__tsLoad) {
    window.__tsLoad = new Promise<void>((res, rej) => {
      const s = document.createElement("script");
      s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      s.async = true; s.onload = () => res(); s.onerror = () => { window.__tsLoad = undefined; rej(new Error("turnstile")); };
      document.head.appendChild(s);
    });
  }
  return window.__tsLoad;
}

export function useTurnstile() {
  const enabled = !!SITE_KEY;
  const [token, setToken] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const tokenRef = useRef<string | null>(null);
  const waiters = useRef<Array<(t: string | null) => void>>([]);
  const settle = (t: string | null) => { tokenRef.current = t; if (t) { waiters.current.splice(0).forEach((w) => w(t)); } };
  const box = useRef<HTMLDivElement | null>(null);
  const id = useRef<string | null>(null);

  const attach = useCallback((el: HTMLDivElement | null) => {
    box.current = el;
    if (!el || !SITE_KEY || id.current) return;
    loadScript().then(() => {
      if (!box.current || id.current || !window.turnstile) return;
      id.current = window.turnstile.render(box.current, {
        sitekey: SITE_KEY,
        appearance: "interaction-only", // invisible unless Cloudflare needs the person to tick a box
        callback: (t: string) => { setToken(t); settle(t); setFailed(false); setErrorCode(null); },
        "expired-callback": () => { setToken(null); settle(null); },
        "error-callback": (code?: unknown) => { setToken(null); settle(null); waiters.current.splice(0).forEach((w) => w(null)); setFailed(true); setErrorCode(code ? String(code) : "unknown"); return true; },
      });
    }).catch(() => setFailed(true));
  }, []);

  useEffect(() => () => {
    if (id.current && window.turnstile) { try { window.turnstile.remove(id.current); } catch { /* gone */ } }
    id.current = null;
  }, []);

  // Tokens are single-use: ask for a fresh one after every attempt.
  const reset = useCallback(() => {
    setToken(null); tokenRef.current = null;
    if (id.current && window.turnstile) { try { window.turnstile.reset(id.current); } catch { /* ignore */ } }
  }, []);

  /** Resolves with a token as soon as one exists (waits up to `ms`), or null if Cloudflare never delivered one. */
  const getToken = useCallback((ms = 12000): Promise<string | null> => {
    if (tokenRef.current) return Promise.resolve(tokenRef.current);
    return new Promise((resolve) => {
      const w = (t: string | null) => { clearTimeout(timer); resolve(t); };
      const timer = setTimeout(() => { waiters.current = waiters.current.filter((x) => x !== w); resolve(null); }, ms);
      waiters.current.push(w);
    });
  }, []);

  const widget = enabled ? <div ref={attach} style={{ display: "flex", justifyContent: "center", minHeight: 0 }} /> : null;
  return { enabled, token, failed, errorCode, getToken, reset, widget };
}
