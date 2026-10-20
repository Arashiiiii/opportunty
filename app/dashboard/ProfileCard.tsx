"use client";
import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { CVData } from "@/app/cv/_lib/schema";
import { useDash, PRIMARY, INK, MUTED, LINE } from "./_ui";

const supabase = createClient();

export interface Profile {
  full_name: string | null; headline: string | null; phone: string | null; city: string | null;
  linkedin: string | null; website: string | null; avatar_url: string | null;
}
type Fields = Omit<Profile, "avatar_url">;

const EMPTY: Fields = { full_name: "", headline: "", phone: "", city: "", linkedin: "", website: "" };

/** First suggestion when there is no saved profile yet: what the user already typed into their latest CV. */
function fromCV(cv: CVData | null): Fields {
  if (!cv) return EMPTY;
  const p = cv.profile;
  return {
    full_name: `${p.firstName} ${p.lastName}`.trim(), headline: p.title, phone: p.phone, city: p.city,
    linkedin: p.linkedin ?? "", website: p.website ?? "",
  };
}

/** Square-crop and shrink the photo in the browser: small upload, fast page, and phone photos (often 5MB+) always fit. */
async function toAvatarBlob(file: File, size = 512): Promise<Blob> {
  const bmp = await createImageBitmap(file);
  const s = Math.min(bmp.width, bmp.height);
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  canvas.getContext("2d")!.drawImage(bmp, (bmp.width - s) / 2, (bmp.height - s) / 2, s, s, 0, 0, size, size);
  return await new Promise((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error("blob"))), "image/jpeg", 0.88));
}

const initials = (name: string, email: string) =>
  (name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("") || email[0] || "?").toUpperCase();

export function ProfileCard({ userId, email, profile, latestCV, onSaved }: {
  userId: string; email: string; profile: Profile | null; latestCV: CVData | null; onSaved: (p: Profile) => void;
}) {
  const { d } = useDash();
  const prefill = !profile ? fromCV(latestCV) : null;
  const base: Fields = profile ?? prefill ?? EMPTY;
  const [editing, setEditing] = useState(false);
  const [f, setF] = useState<Fields>(base);
  const [avatar, setAvatar] = useState<string | null>(profile?.avatar_url ?? null);
  const [busy, setBusy] = useState<"save" | "photo" | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const shown: Fields = editing ? f : base;
  const empty = !shown.full_name && !shown.headline && !shown.phone && !shown.city;

  const persist = async (fields: Fields, avatarUrl: string | null) => {
    const row = { user_id: userId, ...Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, (v ?? "").trim() || null])), avatar_url: avatarUrl, updated_at: new Date().toISOString() };
    const { error } = await supabase.from("profiles").upsert(row, { onConflict: "user_id" });
    if (error) throw error;
    onSaved({ ...(row as unknown as Profile) });
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy("save"); setMsg(null);
    try { await persist(f, avatar); setEditing(false); setMsg({ ok: true, text: d.savedP }); }
    catch { setMsg({ ok: false, text: d.saveFailedP }); }
    finally { setBusy(null); }
  };

  const pickPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) { setMsg({ ok: false, text: d.photoBad }); return; }
    setBusy("photo"); setMsg(null);
    try {
      const blob = await toAvatarBlob(file);
      const path = `${userId}/avatar.jpg`;
      const up = await supabase.storage.from("avatars").upload(path, blob, { upsert: true, contentType: "image/jpeg", cacheControl: "3600" });
      if (up.error) throw up.error;
      const url = `${supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl}?v=${Date.now()}`;
      await persist(editing ? f : base, url);
      setAvatar(url);
      setMsg({ ok: true, text: d.savedP });
    } catch { setMsg({ ok: false, text: d.photoFail }); }
    finally { setBusy(null); }
  };

  const input: React.CSSProperties = { width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 10, border: `1px solid ${LINE}`, fontSize: 14, fontFamily: "inherit", background: "#ffffff" };
  const label: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 4, fontSize: 12.5, fontWeight: 600, color: MUTED };
  const url = (s: string) => (/^https?:\/\//i.test(s) ? s : `https://${s}`);

  return (
    <section style={{ border: `1px solid ${LINE}`, borderRadius: 12, padding: 20, background: "#fff", marginBottom: 16 }}>
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={pickPhoto} style={{ display: "none" }} />
      <div className="dash-prof" style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <button type="button" onClick={() => fileRef.current?.click()} disabled={busy === "photo"} aria-label={avatar ? d.changePhoto : d.addPhoto}
            style={{ position: "relative", width: 96, height: 96, borderRadius: "50%", border: `2px solid ${LINE}`, padding: 0, overflow: "hidden", cursor: busy ? "wait" : "pointer", background: PRIMARY, color: "#ffffff", fontSize: 32, fontWeight: 800, fontFamily: "inherit" }}>
            {avatar
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={avatar} alt="" width={96} height={96} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", opacity: busy === "photo" ? 0.5 : 1 }} />
              : initials(shown.full_name ?? "", email)}
          </button>
          <button type="button" onClick={() => fileRef.current?.click()} disabled={busy === "photo"}
            style={{ fontSize: 12.5, fontWeight: 700, color: PRIMARY, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", padding: 0 }}>
            {avatar ? d.changePhoto : d.addPhoto}
          </button>
        </div>

        <div style={{ flex: "1 1 260px", minWidth: 0 }}>
          {!editing ? (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
                <div style={{ minWidth: 0 }}>
                  <div dir="auto" style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.5px", lineHeight: 1.15 }}>{shown.full_name || d.yourName}</div>
                  {shown.headline && <div dir="auto" style={{ fontSize: 15, color: MUTED, marginTop: 2 }}>{shown.headline}</div>}
                </div>
                <button type="button" onClick={() => { setF(base); setEditing(true); setMsg(null); }}
                  style={{ fontSize: 14, fontWeight: 700, padding: "9px 16px", borderRadius: 10, border: "1px solid rgba(14,26,33,0.24)", background: "#ffffff", color: INK, cursor: "pointer", fontFamily: "inherit" }}>{d.editProfile}</button>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 18px", marginTop: 14, fontSize: 14, color: "#26343d" }}>
                <span dir="ltr">✉ {email}</span>
                {shown.phone && <span dir="ltr">☎ {shown.phone}</span>}
                {shown.city && <span dir="auto">⌖ {shown.city}</span>}
                {shown.linkedin && <a href={url(shown.linkedin)} target="_blank" rel="noopener noreferrer" style={{ color: PRIMARY, textDecoration: "none", fontWeight: 600 }}>in LinkedIn ↗</a>}
                {shown.website && <a href={url(shown.website)} target="_blank" rel="noopener noreferrer" style={{ color: PRIMARY, textDecoration: "none", fontWeight: 600 }}>{d.websiteL} ↗</a>}
              </div>
              {(empty || prefill) && <p style={{ margin: "12px 0 0", fontSize: 13, color: "#075f91", background: "#eaf6fc", border: "1px solid #9fd3ea", borderRadius: 10, padding: "8px 12px" }}>{prefill && !empty ? d.fromCV : d.completeProfile}</p>}
            </>
          ) : (
            <form onSubmit={save} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 12 }}>
              <label style={label}>{d.fullName}<input dir="auto" value={f.full_name ?? ""} onChange={(e) => setF({ ...f, full_name: e.target.value })} maxLength={80} style={input} /></label>
              <label style={label}>{d.headline}<input dir="auto" value={f.headline ?? ""} onChange={(e) => setF({ ...f, headline: e.target.value })} maxLength={80} style={input} /></label>
              <label style={label}>{d.emailL}<input dir="ltr" value={email} disabled style={{ ...input, background: "#f3f2ed", color: MUTED }} /></label>
              <label style={label}>{d.phoneL}<input dir="ltr" type="tel" value={f.phone ?? ""} onChange={(e) => setF({ ...f, phone: e.target.value })} maxLength={30} style={input} /></label>
              <label style={label}>{d.cityL}<input dir="auto" value={f.city ?? ""} onChange={(e) => setF({ ...f, city: e.target.value })} maxLength={60} style={input} /></label>
              <label style={label}>{d.linkedinL}<input dir="ltr" value={f.linkedin ?? ""} onChange={(e) => setF({ ...f, linkedin: e.target.value })} placeholder="linkedin.com/in/…" maxLength={200} style={input} /></label>
              <label style={label}>{d.websiteL}<input dir="ltr" value={f.website ?? ""} onChange={(e) => setF({ ...f, website: e.target.value })} maxLength={200} style={input} /></label>
              <div style={{ gridColumn: "1 / -1", display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button type="submit" disabled={busy === "save"} style={{ fontSize: 14, fontWeight: 700, padding: "10px 20px", borderRadius: 10, border: "none", background: PRIMARY, color: "#ffffff", cursor: busy ? "wait" : "pointer", fontFamily: "inherit" }}>{busy === "save" ? d.savingP : d.saveProfile}</button>
                <button type="button" onClick={() => { setEditing(false); setMsg(null); }} style={{ fontSize: 14, fontWeight: 700, padding: "10px 20px", borderRadius: 10, border: "1px solid rgba(14,26,33,0.24)", background: "#ffffff", color: INK, cursor: "pointer", fontFamily: "inherit" }}>{d.cancel}</button>
              </div>
            </form>
          )}
          {msg && <p role="status" style={{ margin: "10px 0 0", fontSize: 13, fontWeight: 600, color: msg.ok ? "#166534" : "#991b1b" }}>{msg.ok ? "✓ " : "⚠ "}{msg.text}</p>}
        </div>
      </div>
    </section>
  );
}
