"use client";
import Link from "next/link";
import { useDash, LINE, INK, MUTED, PRIMARY } from "../_ui";
import { ET } from "./_t";

export function SubNav({ active }: { active: "market" | "jobs" | "apps" }) {
  const { lang } = useDash();
  const t = ET[lang];
  const tabs = [
    { id: "market", href: "/dashboard/employer", label: t.tabMarket },
    { id: "jobs", href: "/dashboard/employer/jobs", label: t.tabJobs },
    { id: "apps", href: "/dashboard/employer/applications", label: t.tabApps },
  ] as const;
  return (
    <div style={{ display: "flex", gap: 4, borderBottom: `1px solid ${LINE}`, marginBottom: 20, overflowX: "auto" }}>
      {tabs.map((x) => (
        <Link key={x.id} href={x.href} style={{ padding: "10px 16px", fontSize: 15, fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap",
          color: active === x.id ? INK : MUTED, borderBottom: `2px solid ${active === x.id ? PRIMARY : "transparent"}`, marginBottom: -1 }}>{x.label}</Link>
      ))}
    </div>
  );
}
