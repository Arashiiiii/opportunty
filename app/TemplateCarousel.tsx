"use client";

/**
 * Dependency-free, Glide.js-style carousel for the CV templates:
 * a translate3d track, centred focus (`focusAt: center`) with peeking
 * neighbours, drag/swipe, arrows, bullets, keyboard, and Glide's default
 * easing. Written here instead of pulling in the library so it stays
 * React-friendly and tiny.
 */
import { useCallback, useEffect, useRef, useState } from "react";

export interface CarouselTemplate { id: string; name: string; sub: string; accent: string }

const GAP = 20;
const EASE = "transform 450ms cubic-bezier(0.165, 0.84, 0.44, 1)"; // Glide's default animationTimingFunc
const PRIMARY = "#ff4f00";

export function TemplateCarousel({
  templates, onUse, autoplayMs = 4500, compact = false, labels,
}: {
  templates: CarouselTemplate[];
  onUse: (id: string) => void;
  autoplayMs?: number;
  compact?: boolean;
  labels?: { use: string; prev: string; next: string };
}) {
  const L = labels ?? { use: "Use this template →", prev: "Previous template", next: "Next template" };
  const [index, setIndex] = useState(0);
  const [width, setWidth] = useState(1000);
  const [dragDx, setDragDx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [paused, setPaused] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const start = useRef<{ x: number; id: number } | null>(null);
  const moved = useRef(false);
  const last = templates.length - 1;

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    ro.observe(el);
    setWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  const slideW = compact ? Math.min(140, Math.max(105, width * 0.28)) : Math.min(280, Math.max(190, width * 0.58));
  const slideH = slideW * (2339 / 1653);

  const go = useCallback((i: number) => setIndex(Math.max(0, Math.min(last, i))), [last]);
  const next = useCallback(() => setIndex((i) => (i >= last ? 0 : i + 1)), [last]); // autoplay rewinds like Glide's `rewind`

  // Autoplay, paused on hover/focus/drag (Glide: hoverpause)
  useEffect(() => {
    if (!autoplayMs || paused || dragging) return;
    const t = setInterval(next, autoplayMs);
    return () => clearInterval(t);
  }, [autoplayMs, paused, dragging, next]);

  const onPointerDown = (e: React.PointerEvent) => {
    start.current = { x: e.clientX, id: e.pointerId };
    moved.current = false;
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!start.current) return;
    const dx = e.clientX - start.current.x;
    if (!dragging && Math.abs(dx) > 6) {
      setDragging(true);
      rootRef.current?.setPointerCapture(start.current.id);
    }
    if (Math.abs(dx) > 6) moved.current = true;
    if (dragging || Math.abs(dx) > 6) setDragDx(dx);
  };
  const endDrag = () => {
    if (!start.current) return;
    const threshold = slideW / 4; // Glide's swipeThreshold analogue
    if (dragDx < -threshold) go(index + Math.round(Math.abs(dragDx) / (slideW + GAP) + 0.4));
    else if (dragDx > threshold) go(index - Math.round(Math.abs(dragDx) / (slideW + GAP) + 0.4));
    start.current = null;
    setDragging(false);
    setDragDx(0);
  };

  const offset = width / 2 - (index * (slideW + GAP) + slideW / 2) + dragDx;
  const active = templates[index];

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") { e.preventDefault(); go(index + 1); }
        if (e.key === "ArrowLeft") { e.preventDefault(); go(index - 1); }
      }}
      role="region"
      aria-roledescription="carousel"
      aria-label="CV templates"
      tabIndex={0}
      style={{ outline: "none", position: "relative" }}
    >
      <div
        ref={rootRef}
        dir="ltr"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        style={{ overflow: "hidden", padding: compact ? "14px 0 10px" : "28px 0 24px", cursor: dragging ? "grabbing" : "grab", touchAction: "pan-y", userSelect: "none" }}
      >
        <div style={{ display: "flex", gap: GAP, transform: `translate3d(${offset}px,0,0)`, transition: dragging ? "none" : EASE, willChange: "transform" }}>
          {templates.map((t, i) => {
            const isActive = i === index;
            return (
              <div
                key={t.id}
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${templates.length}: ${t.name}`}
                onClick={() => { if (!moved.current) go(i); }}
                style={{
                  flex: `0 0 ${slideW}px`, height: slideH, borderRadius: 10, overflow: "hidden", background: "#fffefb",
                  border: `2px solid ${isActive ? PRIMARY : "rgba(32,21,21,0.12)"}`,
                  transform: `scale(${isActive ? 1 : 0.86})`, opacity: isActive ? 1 : 0.6,
                  boxShadow: isActive ? "0 18px 40px rgba(255,79,0,0.22), 0 4px 12px rgba(32,21,21,0.12)" : "0 2px 8px rgba(32,21,21,0.08)",
                  transition: dragging ? "none" : "transform 450ms cubic-bezier(0.165,0.84,0.44,1), opacity 450ms, box-shadow 450ms, border-color 450ms",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/templates/${t.id}.png`} alt={`${t.name} CV template`} draggable={false} loading={Math.abs(i - index) < 3 ? "eager" : "lazy"} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", display: "block", pointerEvents: "none" }} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Arrows (Glide: controls) */}
      {(["prev", "next"] as const).map((dir) => {
        const disabled = dir === "prev" ? index === 0 : index === last;
        return (
          <button
            key={dir}
            type="button"
            aria-label={dir === "prev" ? L.prev : L.next}
            disabled={disabled}
            onClick={() => go(index + (dir === "prev" ? -1 : 1))}
            className="opp-car-arrow"
            style={{
              position: "absolute", top: compact ? "38%" : "42%", [dir === "prev" ? "left" : "right"]: 4, width: compact ? 34 : 44, height: compact ? 34 : 44, borderRadius: 9999,
              border: "1px solid rgba(32,21,21,0.15)", background: "#fffefb", boxShadow: "0 4px 14px rgba(32,21,21,0.15)",
              cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.35 : 1, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#201515" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points={dir === "prev" ? "15 18 9 12 15 6" : "9 18 15 12 9 6"} />
            </svg>
          </button>
        );
      })}

      {/* Caption + CTA for the focused slide */}
      <div style={compact ? { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" } : { textAlign: "center", marginTop: 4 }} aria-live="polite">
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: compact ? 16 : 20, fontWeight: 600 }}>{active.name}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: active.accent, background: `${active.accent}1f`, borderRadius: 9999, padding: "1px 8px" }}>Pro</span>
          </div>
          <div style={{ fontSize: 13, color: "#939084", margin: compact ? 0 : "2px 0 14px" }}>{active.sub}</div>
        </div>
        <button
          type="button"
          onClick={() => onUse(active.id)}
          style={{ fontSize: 14.4, fontWeight: 700, letterSpacing: "0.144px", padding: compact ? "9px 18px" : "12px 28px", borderRadius: 10, border: "none", background: PRIMARY, color: "#fffefb", cursor: "pointer", fontFamily: "inherit" }}
        >
          {L.use}
        </button>
      </div>

      {/* Bullets (Glide: bullets) */}
      <div role="tablist" aria-label="Choose template" style={{ display: compact ? "none" : "flex", justifyContent: "center", gap: 8, marginTop: 18 }}>
        {templates.map((t, i) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={`Go to ${t.name}`}
            onClick={() => go(i)}
            style={{ width: i === index ? 24 : 8, height: 8, borderRadius: 9999, border: "none", padding: 0, cursor: "pointer", background: i === index ? PRIMARY : "rgba(32,21,21,0.2)", transition: "width 250ms, background 250ms" }}
          />
        ))}
      </div>
    </div>
  );
}
