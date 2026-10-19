/**
 * Brand wordmark: "oppor" in ink, "tunty" in the brand orange.
 * `onDark` flips the ink part to cream for dark backgrounds (footer).
 * `tld` appends ".com" in the ink colour.
 */
export const BRAND_ACCENT = "#ff4f00";

export function Wordmark({ onDark = false, tld = false, style }: { onDark?: boolean; tld?: boolean; style?: React.CSSProperties }) {
  return (
    <span dir="ltr" style={{ unicodeBidi: "isolate", color: onDark ? "#fffefb" : "#201515", ...style }}>
      oppor<span style={{ color: BRAND_ACCENT }}>tunty</span>{tld && ".com"}
    </span>
  );
}
