"use client";
/**
 * /cv/[id]/checkout — the download's payment step (Dodo Payments).
 *
 *  - already unlocked      → "Download PDF" (→ /cv/[id]/print)
 *  - not paid              → "Pay & download" → POST /api/payments/checkout → Dodo hosted page
 *  - back from Dodo        → ?payment_id=…&status=succeeded → POST /api/payments/confirm
 *    (the server re-reads the payment from Dodo; the webhook is a backup)
 */
import { Suspense, useCallback, useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useUI } from "@/app/_lib/useUiLang";
import { UiLangSwitch } from "@/app/_components/UiLangSwitch";
import { LogoMark } from "../../../_components/LogoMark";

const supabase = createClient();
type Phase = "loading" | "unpaid" | "redirecting" | "confirming" | "paid";

function Checkout() {
  const { u, rtl } = useUI();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const search = useSearchParams();
  const id = params.id;
  const paymentId = search.get("payment_id");
  const returnedStatus = search.get("status");

  const [cv, setCv] = useState<{ name: string; template: string } | null>(null);
  const [phase, setPhase] = useState<Phase>("loading");
  const [msg, setMsg] = useState<string | null>(null);

  const checkOwned = useCallback(async (template: string) => {
    const { data } = await supabase.from("cv_template_purchases").select("id").eq("template_id", template).maybeSingle();
    return !!data;
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.from("cvs").select("name, template").eq("id", id).single();
      if (cancelled || !data) return;
      setCv(data);

      if (await checkOwned(data.template)) { if (!cancelled) setPhase("paid"); return; }

      if (paymentId && returnedStatus !== "failed" && returnedStatus !== "cancelled") {
        setPhase("confirming");
        // Poll briefly: the payment can take a moment to settle on Dodo's side.
        for (let i = 0; i < 6 && !cancelled; i++) {
          const res = await fetch("/api/payments/confirm", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ paymentId }) });
          const j = await res.json().catch(() => ({}));
          if (j.paid) { setPhase("paid"); router.replace(`/cv/${id}/checkout`); return; }
          if (!res.ok) break;
          await new Promise((r) => setTimeout(r, 2000));
        }
        if (!cancelled) { setMsg(u.payPending); setPhase("unpaid"); }
        return;
      }
      setPhase("unpaid");
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, paymentId]);

  const pay = async () => {
    setMsg(null); setPhase("redirecting");
    try {
      const res = await fetch("/api/payments/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ cvId: id }) });
      const j = await res.json();
      if (j.alreadyPaid) { setPhase("paid"); return; }
      if (!res.ok || !j.url) throw new Error(j.error || "checkout");
      window.location.href = j.url;
    } catch {
      setMsg(u.payFailed); setPhase("unpaid");
    }
  };

  const busy = phase === "loading" || phase === "redirecting" || phase === "confirming";
  const btn: React.CSSProperties = { width: "100%", padding: "13px 0", borderRadius: 12, border: "none", background: "#ff4f00", color: "#fffefb", fontSize: 15, fontWeight: 700, fontFamily: "inherit", cursor: "pointer", textDecoration: "none", display: "block", boxSizing: "border-box" };

  return (
    <div dir={rtl ? "rtl" : "ltr"} style={{ minHeight: "100vh", background: "#fffefb", fontFamily: "'Inter', system-ui, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ maxWidth: 440, width: "100%", textAlign: "center" }}>
        <div style={{ marginBottom: 16 }}><UiLangSwitch compact /></div>
        <LogoMark size={44} style={{ margin: "0 auto 20px" }} />

        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#201515", margin: "0 0 8px" }}>
          {phase === "paid" ? u.paidTitle : u.payTitle}
        </h1>
        <p style={{ fontSize: 14.5, color: "#605d52", lineHeight: 1.6, margin: "0 0 4px" }}>
          {cv ? u.cvSavedNamed.split(/(\{name\})/).map((part, i) => part === "{name}" ? <b key={i}>{cv.name}</b> : part.replace("{template}", cv.template)) : u.cvSaved}
        </p>
        <p style={{ fontSize: 14.5, color: "#605d52", lineHeight: 1.6, margin: "0 0 24px" }}>
          {phase === "paid" ? u.paidNote : u.payNote}
        </p>

        {msg && <div style={{ padding: "10px 14px", borderRadius: 8, background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", fontSize: 13, marginBottom: 14 }}>⚠ {msg}</div>}

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {phase === "paid" ? (
            <Link href={`/cv/${id}/print`} style={btn}>↓ {u.downloadNow}</Link>
          ) : (
            <button type="button" onClick={pay} disabled={busy} title={u.payBtnTitle} style={{ ...btn, opacity: busy ? 0.7 : 1, cursor: busy ? "wait" : "pointer" }}>
              {phase === "redirecting" ? u.payRedirecting : phase === "confirming" ? u.payConfirming : u.payBtn}
            </button>
          )}
          <Link href={`/cv/${id}`} style={{ width: "100%", padding: "12px 0", borderRadius: 12, border: "1px solid rgba(32,21,21,0.24)", color: "#201515", textDecoration: "none", fontSize: 14, fontWeight: 600 }}>
            {u.backToEditor}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return <Suspense fallback={null}><Checkout /></Suspense>;
}
