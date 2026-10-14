/** Brand mark — identical to app/icon.svg (the favicon). */
export function LogoMark({ size = 26, style }: { size?: number; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" style={{ flexShrink: 0, display: "block", ...style }}>
      <defs>
        <linearGradient id="opp-logo-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ff7a2f" />
          <stop offset="1" stopColor="#ff4f00" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="15" fill="url(#opp-logo-g)" />
      <circle cx="30" cy="31" r="14" fill="none" stroke="#fffefb" strokeWidth="8" />
      <circle cx="49" cy="46" r="6" fill="#201515" />
    </svg>
  );
}
