"use client";
/**
 * Shared login-gate modal — shown wherever a signed-out visitor hits an
 * action that genuinely needs a real account (downloading, saving to a
 * named account, paying). opportunity.com has no anonymous sessions, so
 * this is the one honest place that says so instead of the action
 * silently failing or proceeding.
 */
import Link from "next/link";

interface Props {
  onClose: () => void;
  /** Where to send the user back to after they sign in. */
  next?: string;
  title?: string;
  message?: string;
}

export function LoginGateModal({ onClose, next, title, message }: Props) {
  const nextParam = next ? `?next=${encodeURIComponent(next)}` : "";
  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 9000, background: "rgba(32,21,21,0.55)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: "#fffefb", borderRadius: 16, padding: 32, width: "100%", maxWidth: 380, textAlign: "center", boxShadow: "0 24px 64px rgba(0,0,0,.2)" }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: "linear-gradient(135deg, #ff4f00 0%, #ff4f00 50%, #201515 50%, #201515 100%)", margin: "0 auto 16px" }} />
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 8px" }}>{title ?? "Sign in to continue"}</h2>
        <p style={{ fontSize: 14, color: "#605d52", margin: "0 0 24px", lineHeight: 1.5 }}>
          {message ?? "opportunity.com saves and downloads CVs to a real account — no anonymous sessions — so this step needs you signed in."}
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <Link href={`/login${nextParam}`} style={{ flex: 1, padding: "11px 0", borderRadius: 10, border: "1px solid rgba(32,21,21,0.24)", color: "#201515", textDecoration: "none", fontSize: 14, fontWeight: 600 }}>Sign in</Link>
          <Link href={`/signup${nextParam}`} style={{ flex: 1, padding: "11px 0", borderRadius: 10, border: "none", background: "#ff4f00", color: "#fffefb", textDecoration: "none", fontSize: 14, fontWeight: 700 }}>Create account</Link>
        </div>
        <button type="button" onClick={onClose} style={{ marginTop: 16, background: "none", border: "none", color: "#939084", fontSize: 13, cursor: "pointer" }}>Not now</button>
      </div>
    </div>
  );
}
