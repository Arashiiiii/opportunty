import type { Metadata } from "next";
import { LegalPage } from "../_components/LegalPage";

export const metadata: Metadata = {
  title: "Privacy policy — opportunity.com",
  description: "How opportunity.com collects, uses and protects your personal data, and the rights you have.",
  alternates: { canonical: "/privacy" },
};

export default function Page() {
  return <LegalPage slug="privacy" />;
}
