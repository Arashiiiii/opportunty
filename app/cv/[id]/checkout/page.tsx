"use client";
/**
 * /cv/[id]/checkout — the download's payment step.
 *
 * Placeholder: Dodo Payments isn't wired up yet (Reda is setting that up
 * separately), so this page is honest about that instead of faking a
 * working paywall or silently giving away free downloads. Once Dodo is
 * connected, the "Pay & download" button here starts a real checkout and,
 * on success, opens /cv/[id]/print — the print route itself stays behind
 * this page either way.
 */
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export default function CheckoutPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [cv, setCv] = useState<{ name: string; template: string } | null>(null);

  useEffect(() => {
    supabase
      .from("cvs")
      .select("name, template")
      .eq("id", id)
      .single()
      .then(({ data }) => { if (data) setCv(data); });
  }, [id]);

  return (
    <div style={{ minHeight: "100vh", background: "#fffefb", fontFamily: "'Inter', system-ui, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ maxWidth: 440, width: "100%", textAlign: "center" }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg, #ff4f00 0%, #ff4f00 50%, #201515 50%, #201515 100%)", margin: "0 auto 20px" }} />

        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#201515", margin: "0 0 8px" }}>
          Payments are launching soon
        </h1>
        <p style={{ fontSize: 14.5, color: "#605d52", lineHeight: 1.6, margin: "0 0 4px" }}>
          {cv ? <>Your CV <b>&ldquo;{cv.name}&rdquo;</b> ({cv.template}) is saved and ready.</> : "Your CV is saved and ready."}
        </p>
        <p style={{ fontSize: 14.5, color: "#605d52", lineHeight: 1.6, margin: "0 0 28px" }}>
          We&apos;re finishing checkout — pay once, no subscription, then download instantly. Come back to this page once it&apos;s live to complete your download.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button
            type="button"
            disabled
            title="Checkout isn't live yet"
            style={{ width: "100%", padding: "13px 0", borderRadius: 12, border: "none", background: "#e5ded3", color: "#a39c8f", fontSize: 15, fontWeight: 700, cursor: "not-allowed", fontFamily: "inherit" }}
          >
            Pay &amp; download — coming soon
          </button>
          <Link
            href={`/cv/${id}`}
            style={{ width: "100%", padding: "12px 0", borderRadius: 12, border: "1px solid rgba(32,21,21,0.24)", color: "#201515", textDecoration: "none", fontSize: 14, fontWeight: 600 }}
          >
            ← Back to editor
          </Link>
        </div>
      </div>
    </div>
  );
}
