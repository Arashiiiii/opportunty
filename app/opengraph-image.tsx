import { ImageResponse } from "next/og";

export const alt = "opportunty.com — Job search & free AI CV builder";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#ffffff", padding: 72, fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <svg width="84" height="84" viewBox="0 0 64 64">
            <rect width="64" height="64" rx="15" fill="#0079a8" />
            <circle cx="30" cy="31" r="14" fill="none" stroke="#ffffff" strokeWidth="8" />
            <circle cx="49" cy="46" r="6" fill="#0e1a21" />
          </svg>
          <div style={{ display: "flex", fontSize: 48, fontWeight: 700, color: "#0e1a21" }}>opportunty<span style={{ color: "#0079a8" }}>.com</span></div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", fontSize: 78, fontWeight: 700, lineHeight: 1.05, color: "#0e1a21" }}>Find work you actually want</div>
          <div style={{ display: "flex", fontSize: 34, color: "#26343d" }}>Drag a job onto your CV — AI tailors it. Free CV builder, ATS-friendly templates.</div>
        </div>
        <div style={{ display: "flex", gap: 14, fontSize: 28, color: "#0e1a21", fontWeight: 600 }}>
          <span>Morocco</span><span>·</span><span>France</span><span>·</span><span>Germany</span><span>·</span><span>Belgium</span><span>·</span><span>Netherlands</span><span>·</span><span>Saudi Arabia</span>
        </div>
      </div>
    ),
    size,
  );
}
