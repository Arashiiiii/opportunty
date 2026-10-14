import type { Metadata } from "next";
import { LegalPage } from "../_components/LegalPage";

export const metadata: Metadata = {
  title: "Terms of use — opportunity.com",
  description: "Terms of use (CGU) of opportunity.com: accounts, job offers, AI-generated content, payments and liability.",
  alternates: { canonical: "/terms" },
};

export default function Page() {
  return <LegalPage slug="terms" />;
}
