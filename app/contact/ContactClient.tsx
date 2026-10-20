"use client";
import { useState } from "react";
import { PageShell } from "../_components/LegalShell";
import { useUiLang } from "../_lib/useUiLang";
import { CONTACT } from "../_lib/legal-dict";
import { COMPANY } from "../_lib/company";

const field: React.CSSProperties = { padding: "11px 14px", borderRadius: 10, border: "1px solid #e3e8eb", fontSize: 14, fontFamily: "inherit", background: "#fff", width: "100%", boxSizing: "border-box" };

export function ContactClient() {
  const [lang] = useUiLang();
  const c = CONTACT[lang];
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState(0);
  const [message, setMessage] = useState("");

  const send = (ev: React.FormEvent) => {
    ev.preventDefault();
    const subject = `[${CONTACT.en.topics[topic]}] ${name}`.trim();
    const body = `${message}\n\n— ${name} <${email}>`;
    window.location.href = `mailto:${COMPANY.contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <PageShell>
      <h1 style={{ fontSize: "clamp(28px, 4vw, 38px)", fontWeight: 600, margin: "0 0 10px" }}>{c.title}</h1>
      <p style={{ fontSize: 16, color: "#26343d", lineHeight: 1.6, margin: "0 0 28px" }}>{c.intro}</p>
      <form onSubmit={send} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <input required dir="auto" placeholder={c.name} value={name} onChange={(e) => setName(e.target.value)} style={field} />
        <input required type="email" placeholder={c.email} value={email} onChange={(e) => setEmail(e.target.value)} style={field} />
        <select aria-label={c.topic} value={topic} onChange={(e) => setTopic(Number(e.target.value))} style={field}>
          {c.topics.map((t, i) => <option key={t} value={i}>{t}</option>)}
        </select>
        <textarea required dir="auto" rows={6} placeholder={c.message} value={message} onChange={(e) => setMessage(e.target.value)} style={{ ...field, resize: "vertical" }} />
        <button type="submit" style={{ padding: "12px 14px", borderRadius: 10, border: "none", background: "#0079a8", color: "#ffffff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>{c.send}</button>
        <p style={{ fontSize: 12.5, color: "#5f7280", margin: 0 }}>{c.reply} {c.privacyNote}</p>
      </form>
      <p style={{ fontSize: 14, color: "#26343d", marginTop: 28 }}>{c.direct} <a href={`mailto:${COMPANY.contactEmail}`} style={{ color: "#0079a8", fontWeight: 600, textDecoration: "none" }}>{COMPANY.contactEmail}</a></p>
    </PageShell>
  );
}
