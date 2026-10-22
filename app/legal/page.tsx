import type { Metadata } from "next";
import { LegalPage } from "../_components/LegalPage";

export const metadata: Metadata = {
  title: "Legal notice — opportunty.com",
  description: "Legal notice: publisher and hosting information for opportunty.com.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/legal" },
};

export default function Page() {
  return <LegalPage slug="legal" />;
}
