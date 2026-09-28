"use client";
import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy]         = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [done, setDone]         = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { error: err } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: typeof window !== "undefined" ? `${window.location.origin}/cv` : undefined },
    });
    setBusy(false);
    if (err) { setError(err.message); return; }
    setDone(true);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#fffefb", fontFamily: "'Inter', system-ui, sans-serif", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 380 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 32, textDecoration: "none" }}>
          <div style={{ width: 26, height: 26, borderRadius: 6, background: "linear-gradient(135deg, #ff4f00 0%, #ff4f00 50%, #201515 50%, #201515 100%)" }} />
          <span style={{ fontSize: 15, fontWeight: 700, color: "#201515" }}>opportunity<span style={{ color: "#ff4f00" }}>.com</span></span>
        </Link>

        {done ? (
          <div style={{ padding: "16px 18px", borderRadius: 10, background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", fontSize: 13.5 }}>
            Check your inbox to confirm <b>{email}</b>, then sign in.
          </div>
        ) : (
          <>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "#201515", margin: "0 0 6px" }}>Create your account</h1>
            <p style={{ fontSize: 13, color: "#6b6259", margin: "0 0 24px" }}>
              Job feed + AI-tailored CVs, saved to your own account.
            </p>

            {error && (
              <div style={{ padding: "10px 14px", borderRadius: 8, background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", fontSize: 13, marginBottom: 16 }}>
                ⚠ {error}
              </div>
            )}

            <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
                style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #e5ded3", fontSize: 14, fontFamily: "inherit" }} />
              <input type="password" required minLength={6} placeholder="Password (min 6 characters)" value={password} onChange={(e) => setPassword(e.target.value)}
                style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #e5ded3", fontSize: 14, fontFamily: "inherit" }} />
              <button type="submit" disabled={busy}
                style={{ padding: "11px 14px", borderRadius: 10, border: "none", background: "#ff4f00", color: "#fff", fontSize: 14, fontWeight: 700, cursor: busy ? "wait" : "pointer", fontFamily: "inherit", opacity: busy ? 0.7 : 1 }}>
                {busy ? "Creating account…" : "Create account"}
              </button>
            </form>
          </>
        )}

        <p style={{ fontSize: 13, color: "#6b6259", marginTop: 20, textAlign: "center" }}>
          Already have an account? <Link href="/login" style={{ color: "#ff4f00", fontWeight: 600, textDecoration: "none" }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
