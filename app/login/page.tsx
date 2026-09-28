"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/cv";

  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy]       = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (err) { setError(err.message); return; }
    router.push(next);
    router.refresh();
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#fffefb", fontFamily: "'Inter', system-ui, sans-serif", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 380 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 32, textDecoration: "none" }}>
          <div style={{ width: 26, height: 26, borderRadius: 6, background: "linear-gradient(135deg, #ff4f00 0%, #ff4f00 50%, #201515 50%, #201515 100%)" }} />
          <span style={{ fontSize: 15, fontWeight: 700, color: "#201515" }}>opportunity<span style={{ color: "#ff4f00" }}>.com</span></span>
        </Link>

        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#201515", margin: "0 0 6px" }}>Sign in</h1>
        <p style={{ fontSize: 13, color: "#6b6259", margin: "0 0 24px" }}>
          A real account is required — opportunity.com doesn&apos;t use anonymous sessions.
        </p>

        {error && (
          <div style={{ padding: "10px 14px", borderRadius: 8, background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", fontSize: 13, marginBottom: 16 }}>
            ⚠ {error}
          </div>
        )}

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
            style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #e5ded3", fontSize: 14, fontFamily: "inherit" }} />
          <input type="password" required placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
            style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #e5ded3", fontSize: 14, fontFamily: "inherit" }} />
          <button type="submit" disabled={busy}
            style={{ padding: "11px 14px", borderRadius: 10, border: "none", background: "#ff4f00", color: "#fff", fontSize: 14, fontWeight: 700, cursor: busy ? "wait" : "pointer", fontFamily: "inherit", opacity: busy ? 0.7 : 1 }}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p style={{ fontSize: 13, color: "#6b6259", marginTop: 20, textAlign: "center" }}>
          No account yet? <Link href="/signup" style={{ color: "#ff4f00", fontWeight: 600, textDecoration: "none" }}>Create one</Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
