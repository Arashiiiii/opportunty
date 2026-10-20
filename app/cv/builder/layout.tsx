import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free CV builder with AI — 10 ATS-friendly templates | opportunty.com",
  description: "Build your CV online for free: pick one of 10 ATS-friendly templates, edit live, and let AI tailor it to any job offer. English, French and Arabic.",
  alternates: { canonical: "/cv/builder" },
  robots: { index: true, follow: true },
  openGraph: { url: "/cv/builder", title: "Free CV builder with AI — opportunty.com", description: "10 ATS-friendly templates, live editing and AI tailoring to any job." },
};

export default function Layout({ children }: { children: React.ReactNode }) { return children; }
