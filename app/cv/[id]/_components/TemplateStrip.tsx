"use client";
/**
 * TemplateStrip — horizontal strip of 5 template thumbnails + accent picker.
 *
 * Each thumbnail is the template's real screenshot (public/templates/<id>.png).
 *
 * Every template is free to choose and edit with — the paid unlock only
 * gates the PDF download (see Topbar's downloadPDF).
 */

import { useCVStore } from "../../_store/cv-store";
import { TEMPLATE_REGISTRY } from "../../_lib/schema";
import { A4_W, A4_H } from "./templates";
import { AccentPicker } from "./AccentPicker";
import { useUI } from "@/app/_lib/useUiLang";

const THUMB_W     = 80;
const THUMB_H     = Math.round(THUMB_W * A4_H / A4_W); // ≈ 113

export function TemplateStrip() {
  const template    = useCVStore((s) => s.template);
  const setTemplate = useCVStore((s) => s.setTemplate);
  const setAccent   = useCVStore((s) => s.setAccent);

  const { u } = useUI();
  return (
    <div style={{
      display:       "flex",
      gap:           10,
      padding:       "12px 20px",
      borderBottom:  "1px solid #e5e7eb",
      background:    "#fff",
      overflowX:     "auto",
      alignItems:    "center",
      flexShrink:    0,
    }}>
      {/* "Modèles" label */}
      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".14em", color: "#94a3b8", textTransform: "uppercase", marginRight: 4, whiteSpace: "nowrap" }}>
        {u.templates}
      </span>

      {/* Thumbnails */}
      {TEMPLATE_REGISTRY.map((tpl) => {
        const selected = tpl.id === template;
        return (
          <div
            key={tpl.id}
            onClick={() => { setTemplate(tpl.id); setAccent(tpl.accent); }}
            title={tpl.name}
            style={{
              flexShrink:   0,
              width:        THUMB_W + 4,
              padding:      3,
              borderRadius: 10,
              border:       selected ? "1.5px solid #7c3aed" : "1px solid #e5e7eb",
              background:   selected ? "#f5f3ff" : "#fff",
              cursor:       "pointer",
              transition:   "all .15s",
              position:     "relative",
            }}
          >
            {/* Thumbnail: the real template screenshot */}
            <div style={{ width: THUMB_W, height: THUMB_H, overflow: "hidden", borderRadius: 6, border: "1px solid #f0f0f0", background: "#fff" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/templates/${tpl.id}.png`}
                alt={`${tpl.name} template`}
                loading="lazy"
                draggable={false}
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", display: "block", userSelect: "none" }}
              />
            </div>

            {/* Name */}
            <div style={{ fontSize: 10, fontWeight: 600, color: selected ? "#7c3aed" : "#0f172a", textAlign: "center", marginTop: 4, lineHeight: 1.2 }}>
              {tpl.name}
            </div>

            {/* Selected check */}
            {selected && (
              <div style={{
                position:       "absolute", top: 5, left: 5,
                width:          16, height: 16, borderRadius: "50%",
                background:     "#7c3aed", color: "#fff",
                fontSize:       9, fontWeight: 800,
                display:        "flex", alignItems: "center", justifyContent: "center",
              }}>
                ✓
              </div>
            )}
          </div>
        );
      })}

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Accent colour picker */}
      <div style={{ display: "flex", gap: 5, alignItems: "center", borderLeft: "1px solid #e5e7eb", paddingLeft: 14, flexShrink: 0 }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".14em", color: "#94a3b8", textTransform: "uppercase", marginRight: 4 }}>
          Couleur
        </span>
        <AccentPicker />
      </div>
    </div>
  );
}
