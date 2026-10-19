import type { Metadata } from "next";

// The editor is an app screen with no readable content for search engines.
// /cv-builder (and /fr, /ar versions) is the indexable page that sends people here.
export const metadata: Metadata = {
  title: "CV builder — opportunty",
  description: "Build your CV online for free and let AI tailor it to any job offer.",
  robots: { index: false, follow: true },
};

export default function Layout({ children }: { children: React.ReactNode }) { return children; }
