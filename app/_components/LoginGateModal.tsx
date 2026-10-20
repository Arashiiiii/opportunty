"use client";
/**
 * Shared login-gate modal — shown wherever a signed-out visitor hits an
 * action that genuinely needs a real account (downloading, saving to a
 * named account, paying). opportunty.com has no anonymous sessions, so
 * this is the one honest place that says so instead of the action
 * silently failing or proceeding.
 */
import Link from "next/link";
import { useUI } from "@/app/_lib/useUiLang";
import { LogoMark } from "./LogoMark";
import { CodeAuth } from "./CodeAuth";

interface Props {
  onClose: () => void;
  /** Where to send the user back to after they sign in. */
  next?: string;
  title?: string;
  message?: string;
}

export function LoginGateModal({ onClose, next, title, message }: Props) {
  const { u, rtl } = useUI();
  const nextParam = next ? `?next=${encodeURIComponent(next)}` : "";
  return (
    <div
      dir={rtl ? "rtl" : "ltr"}
      style={{ position: "fixed", inset: 0, zIndex: 9000, background: "rgba(14,26,33,0.55)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: "#ffffff", borderRadius: 16, padding: 32, width: "100%", maxWidth: 380, textAlign: "center", boxShadow: "0 24px 64px rgba(0,0,0,.2)" }}>
        <LogoMark size={40} style={{ margin: "0 auto 16px" }} />
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 8px" }}>{title ?? u.gateTitle}</h2>
        <p style={{ fontSize: 14, color: "#26343d", margin: "0 0 24px", lineHeight: 1.5 }}>
          {message ?? u.gateMsg}
        </p>
        {/* Sign in / create account in place: no page change, no password, no mailed link to open. */}
        <div style={{ textAlign: rtl ? "right" : "left" }}><CodeAuth next={next && next.startsWith("/") && !next.startsWith("//") ? next : (typeof window !== "undefined" ? window.location.pathname : "/dashboard")} hideDivider /></div>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", marginTop: 14, fontSize: 13 }}>
          <Link href={`/login${nextParam}`} style={{ color: "#26343d", textDecoration: "underline" }}>{u.signIn}</Link>
          <Link href={`/signup${nextParam}`} style={{ color: "#26343d", textDecoration: "underline" }}>{u.createAccount}</Link>
        </div>
        <button type="button" onClick={onClose} style={{ marginTop: 16, background: "none", border: "none", color: "#5f7280", fontSize: 13, cursor: "pointer" }}>{u.notNow}</button>
      </div>
    </div>
  );
}
