"use client";
/**
 * Small flat SVG previews for each of the 10 CV templates, used on the
 * homepage's template strip. Ported from the opportunity.com design mockup
 * (Artifact 6eda429d…), one <svg> per template id from TEMPLATE_REGISTRY.
 */
import type { TemplateId } from "./cv/_lib/schema";

function hexToRgba(hex: string, alpha: number) {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function TemplateThumb({ id, accent }: { id: TemplateId; accent: string }) {
  const tintBg = hexToRgba(accent, 0.1);
  const tintMid = hexToRgba(accent, 0.35);

  switch (id) {
    case "corso":
      return (
        <svg width="100%" height="100%" viewBox="0 0 160 112">
          <rect x="0" y="0" width="46" height="112" fill={tintBg} />
          <circle cx="23" cy="24" r="13" fill={tintMid} />
          <rect x="10" y="48" width="26" height="5" rx="2" fill="rgba(32,21,21,0.16)" />
          <rect x="10" y="58" width="26" height="5" rx="2" fill="rgba(32,21,21,0.16)" />
          <rect x="10" y="68" width="26" height="5" rx="2" fill="rgba(32,21,21,0.16)" />
          <rect x="58" y="10" width="90" height="8" rx="2" fill="rgba(32,21,21,0.28)" />
          <rect x="58" y="26" width="90" height="6" rx="2" fill="rgba(32,21,21,0.14)" />
          <rect x="58" y="38" width="70" height="6" rx="2" fill="rgba(32,21,21,0.14)" />
          <rect x="58" y="56" width="90" height="6" rx="2" fill="rgba(32,21,21,0.14)" />
          <rect x="58" y="68" width="80" height="6" rx="2" fill="rgba(32,21,21,0.14)" />
          <rect x="58" y="86" width="90" height="6" rx="2" fill="rgba(32,21,21,0.14)" />
        </svg>
      );
    case "meridian":
      return (
        <svg width="100%" height="100%" viewBox="0 0 160 112">
          <rect x="38" y="8" width="84" height="9" rx="2" fill="rgba(32,21,21,0.3)" />
          <rect x="55" y="22" width="50" height="5" rx="2" fill="rgba(32,21,21,0.14)" />
          <rect x="0" y="36" width="160" height="1" fill="rgba(32,21,21,0.12)" />
          <rect x="60" y="44" width="40" height="5" rx="2" fill={tintMid} />
          <rect x="14" y="56" width="132" height="5" rx="2" fill="rgba(32,21,21,0.14)" />
          <rect x="22" y="66" width="116" height="5" rx="2" fill="rgba(32,21,21,0.14)" />
          <rect x="14" y="76" width="132" height="5" rx="2" fill="rgba(32,21,21,0.14)" />
          <rect x="30" y="86" width="100" height="5" rx="2" fill="rgba(32,21,21,0.14)" />
        </svg>
      );
    case "aria":
      return (
        <svg width="100%" height="100%" viewBox="0 0 160 112">
          <rect x="0" y="4" width="90" height="8" rx="2" fill="rgba(32,21,21,0.3)" />
          <rect x="0" y="26" width="26" height="5" rx="2" fill={tintMid} />
          <rect x="40" y="26" width="110" height="5" rx="2" fill="rgba(32,21,21,0.14)" />
          <rect x="40" y="36" width="95" height="5" rx="2" fill="rgba(32,21,21,0.14)" />
          <rect x="0" y="54" width="26" height="5" rx="2" fill={tintMid} />
          <rect x="40" y="54" width="110" height="5" rx="2" fill="rgba(32,21,21,0.14)" />
          <rect x="40" y="64" width="102" height="5" rx="2" fill="rgba(32,21,21,0.14)" />
          <rect x="0" y="82" width="26" height="5" rx="2" fill={tintMid} />
          <rect x="40" y="82" width="110" height="5" rx="2" fill="rgba(32,21,21,0.14)" />
          <rect x="40" y="92" width="88" height="5" rx="2" fill="rgba(32,21,21,0.14)" />
        </svg>
      );
    case "dahab":
      return (
        <svg width="100%" height="100%" viewBox="0 0 160 112">
          <rect x="0" y="0" width="160" height="34" fill={accent} />
          <rect x="10" y="10" width="80" height="8" rx="2" fill="rgba(255,254,251,0.9)" />
          <rect x="10" y="23" width="50" height="4" rx="2" fill="rgba(255,254,251,0.5)" />
          <rect x="0" y="46" width="44" height="5" rx="2" fill={tintMid} />
          <rect x="0" y="58" width="150" height="5" rx="2" fill="rgba(32,21,21,0.14)" />
          <rect x="0" y="68" width="132" height="5" rx="2" fill="rgba(32,21,21,0.14)" />
          <rect x="0" y="78" width="144" height="5" rx="2" fill="rgba(32,21,21,0.14)" />
          <rect x="0" y="92" width="44" height="5" rx="2" fill={tintMid} />
          <rect x="0" y="104" width="120" height="5" rx="2" fill="rgba(32,21,21,0.14)" />
        </svg>
      );
    case "medina":
      return (
        <svg width="100%" height="100%" viewBox="0 0 160 112">
          <circle cx="140" cy="8" r="34" fill={tintBg} />
          <rect x="0" y="8" width="92" height="12" rx="6" fill={tintMid} />
          <rect x="0" y="28" width="30" height="8" rx="4" fill="rgba(32,21,21,0.14)" />
          <rect x="34" y="28" width="30" height="8" rx="4" fill="rgba(32,21,21,0.14)" />
          <rect x="68" y="28" width="30" height="8" rx="4" fill="rgba(32,21,21,0.14)" />
          <circle cx="4" cy="54" r="3" fill={tintMid} />
          <rect x="14" y="52" width="120" height="5" rx="2" fill="rgba(32,21,21,0.14)" />
          <rect x="14" y="61" width="90" height="5" rx="2" fill="rgba(32,21,21,0.14)" />
          <circle cx="4" cy="76" r="3" fill={tintMid} />
          <rect x="14" y="74" width="120" height="5" rx="2" fill="rgba(32,21,21,0.14)" />
          <circle cx="4" cy="96" r="3" fill={tintMid} />
          <rect x="14" y="94" width="120" height="5" rx="2" fill="rgba(32,21,21,0.14)" />
        </svg>
      );
    case "vertex":
      return (
        <svg width="100%" height="100%" viewBox="0 0 160 112">
          <rect x="0" y="0" width="4" height="112" fill={accent} />
          <rect x="14" y="8" width="10" height="6" rx="2" fill={tintMid} />
          <rect x="28" y="8" width="44" height="6" rx="2" fill="rgba(32,21,21,0.3)" />
          <rect x="14" y="22" width="132" height="5" rx="2" fill="rgba(32,21,21,0.14)" />
          <rect x="14" y="32" width="112" height="5" rx="2" fill="rgba(32,21,21,0.14)" />
          <rect x="14" y="44" width="10" height="6" rx="2" fill={tintMid} />
          <rect x="28" y="44" width="44" height="6" rx="2" fill="rgba(32,21,21,0.3)" />
          <rect x="14" y="58" width="132" height="5" rx="2" fill="rgba(32,21,21,0.14)" />
          <rect x="14" y="68" width="112" height="5" rx="2" fill="rgba(32,21,21,0.14)" />
          <rect x="14" y="80" width="10" height="6" rx="2" fill={tintMid} />
          <rect x="28" y="80" width="44" height="6" rx="2" fill="rgba(32,21,21,0.3)" />
          <rect x="14" y="94" width="80" height="5" rx="2" fill="rgba(32,21,21,0.14)" />
        </svg>
      );
    case "atlas":
      return (
        <svg width="100%" height="100%" viewBox="0 0 160 112">
          <rect x="0" y="0" width="50" height="112" fill={accent} />
          <circle cx="25" cy="22" r="12" fill="rgba(255,254,251,0.55)" />
          <rect x="10" y="42" width="30" height="4" rx="2" fill="rgba(255,254,251,0.5)" />
          <rect x="10" y="52" width="30" height="4" rx="2" fill="rgba(255,254,251,0.5)" />
          <rect x="10" y="62" width="30" height="4" rx="2" fill="rgba(255,254,251,0.5)" />
          <rect x="10" y="72" width="30" height="4" rx="2" fill="rgba(255,254,251,0.5)" />
          <rect x="62" y="10" width="82" height="8" rx="2" fill="rgba(32,21,21,0.28)" />
          <rect x="62" y="26" width="88" height="5" rx="2" fill="rgba(32,21,21,0.14)" />
          <rect x="62" y="36" width="68" height="5" rx="2" fill="rgba(32,21,21,0.14)" />
          <rect x="62" y="52" width="88" height="5" rx="2" fill="rgba(32,21,21,0.14)" />
          <rect x="62" y="62" width="78" height="5" rx="2" fill="rgba(32,21,21,0.14)" />
          <rect x="62" y="78" width="88" height="5" rx="2" fill="rgba(32,21,21,0.14)" />
        </svg>
      );
    case "lumen":
      return (
        <svg width="100%" height="100%" viewBox="0 0 160 112">
          <rect x="0" y="0" width="160" height="30" fill={tintBg} />
          <rect x="10" y="8" width="70" height="8" rx="2" fill="rgba(32,21,21,0.3)" />
          <rect x="10" y="20" width="40" height="4" rx="2" fill="rgba(32,21,21,0.16)" />
          <rect x="10" y="42" width="30" height="5" rx="2" fill={tintMid} />
          <rect x="10" y="52" width="70" height="5" rx="2" fill="rgba(32,21,21,0.14)" />
          <rect x="10" y="62" width="70" height="5" rx="2" fill="rgba(32,21,21,0.14)" />
          <rect x="10" y="72" width="70" height="5" rx="2" fill="rgba(32,21,21,0.14)" />
          <rect x="10" y="82" width="70" height="5" rx="2" fill="rgba(32,21,21,0.14)" />
          <rect x="92" y="42" width="30" height="5" rx="2" fill={tintMid} />
          <rect x="92" y="52" width="58" height="5" rx="2" fill="rgba(32,21,21,0.14)" />
          <rect x="92" y="62" width="58" height="5" rx="2" fill="rgba(32,21,21,0.14)" />
          <rect x="92" y="72" width="58" height="5" rx="2" fill="rgba(32,21,21,0.14)" />
          <rect x="92" y="86" width="30" height="5" rx="2" fill={tintMid} />
          <rect x="92" y="96" width="50" height="5" rx="2" fill="rgba(32,21,21,0.14)" />
        </svg>
      );
    case "helix":
      return (
        <svg width="100%" height="100%" viewBox="0 0 160 112">
          <rect x="14" y="4" width="1.5" height="104" fill="rgba(32,21,21,0.14)" />
          <circle cx="15" cy="12" r="3.5" fill={accent} />
          <rect x="28" y="8" width="90" height="6" rx="2" fill="rgba(32,21,21,0.3)" />
          <rect x="28" y="20" width="110" height="5" rx="2" fill="rgba(32,21,21,0.14)" />
          <rect x="28" y="30" width="80" height="5" rx="2" fill="rgba(32,21,21,0.14)" />
          <circle cx="15" cy="44" r="3.5" fill={accent} />
          <rect x="28" y="40" width="90" height="6" rx="2" fill="rgba(32,21,21,0.3)" />
          <rect x="28" y="52" width="110" height="5" rx="2" fill="rgba(32,21,21,0.14)" />
          <rect x="28" y="62" width="80" height="5" rx="2" fill="rgba(32,21,21,0.14)" />
          <circle cx="15" cy="76" r="3.5" fill={accent} />
          <rect x="28" y="72" width="90" height="6" rx="2" fill="rgba(32,21,21,0.3)" />
          <rect x="28" y="84" width="110" height="5" rx="2" fill="rgba(32,21,21,0.14)" />
        </svg>
      );
    case "slate":
      return (
        <svg width="100%" height="100%" viewBox="0 0 160 112">
          <rect x="0" y="0" width="60" height="7" fill="rgba(32,21,21,0.3)" />
          <rect x="110" y="0" width="50" height="4" fill="rgba(32,21,21,0.14)" />
          <rect x="0" y="14" width="160" height="1" fill="rgba(32,21,21,0.3)" />
          <rect x="0" y="24" width="24" height="4" rx="1" fill="rgba(32,21,21,0.3)" />
          <rect x="44" y="24" width="3" height="3" fill="rgba(32,21,21,0.3)" />
          <rect x="52" y="24" width="96" height="4" rx="1" fill="rgba(32,21,21,0.14)" />
          <rect x="52" y="33" width="78" height="4" rx="1" fill="rgba(32,21,21,0.14)" />
          <rect x="0" y="48" width="24" height="4" rx="1" fill="rgba(32,21,21,0.3)" />
          <rect x="44" y="48" width="3" height="3" fill="rgba(32,21,21,0.3)" />
          <rect x="52" y="48" width="96" height="4" rx="1" fill="rgba(32,21,21,0.14)" />
          <rect x="52" y="57" width="78" height="4" rx="1" fill="rgba(32,21,21,0.14)" />
          <rect x="0" y="72" width="24" height="4" rx="1" fill="rgba(32,21,21,0.3)" />
          <rect x="44" y="72" width="3" height="3" fill="rgba(32,21,21,0.3)" />
          <rect x="52" y="72" width="96" height="4" rx="1" fill="rgba(32,21,21,0.14)" />
          <rect x="52" y="81" width="78" height="4" rx="1" fill="rgba(32,21,21,0.14)" />
          <rect x="0" y="96" width="24" height="4" rx="1" fill="rgba(32,21,21,0.3)" />
          <rect x="44" y="96" width="3" height="3" fill="rgba(32,21,21,0.3)" />
          <rect x="52" y="96" width="96" height="4" rx="1" fill="rgba(32,21,21,0.14)" />
        </svg>
      );
    default:
      return null;
  }
}
