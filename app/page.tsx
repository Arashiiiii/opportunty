import Link from "next/link";

export default function Home() {
  return (
    <div style={{ minHeight: "100vh", background: "#fffefb", fontFamily: "'Inter', system-ui, sans-serif", color: "#201515" }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 28px", borderBottom: "1px solid #f2ded1" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 26, height: 26, borderRadius: 6, background: "linear-gradient(135deg, #ff4f00 0%, #ff4f00 50%, #201515 50%, #201515 100%)" }} />
          <span style={{ fontSize: 15, fontWeight: 700 }}>opportunity<span style={{ color: "#ff4f00" }}>.com</span></span>
        </div>
        <nav style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <Link href="/login" style={{ fontSize: 13, color: "#201515", textDecoration: "none" }}>Sign in</Link>
          <Link href="/signup" style={{ fontSize: 13, fontWeight: 700, color: "#fff", background: "#ff4f00", padding: "8px 16px", borderRadius: 8, textDecoration: "none" }}>Get started</Link>
        </nav>
      </header>

      <main style={{ maxWidth: 760, margin: "0 auto", padding: "96px 24px", textAlign: "center" }}>
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "#ff4f00", margin: "0 0 16px" }}>
          Job search + AI CV tailoring
        </p>
        <h1 style={{ fontSize: 40, fontWeight: 800, lineHeight: 1.15, margin: "0 0 20px" }}>
          Find work you actually want
        </h1>
        <p style={{ fontSize: 16, color: "#6b6259", margin: "0 0 32px", lineHeight: 1.6 }}>
          Browse live job listings, drag one onto your CV, and let AI tailor your experience
          to match — built on the same CV editor and templates as Talent Maroc.
        </p>
        <Link href="/signup" style={{ display: "inline-block", padding: "13px 28px", borderRadius: 10, background: "#ff4f00", color: "#fff", fontWeight: 700, fontSize: 15, textDecoration: "none" }}>
          Create your free account
        </Link>
      </main>
    </div>
  );
}
