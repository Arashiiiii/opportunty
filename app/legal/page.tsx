import type { Metadata } from "next";
import { LegalPage } from "../_components/LegalPage";

export const metadata: Metadata = {
  title: "Legal notice — opportunity.com",
  description: "Legal notice: publisher and hosting information for opportunity.com.",
  alternates: { canonical: "/legal" },
};

export default function Page() {
  return <LegalPage slug="legal" />;
}
