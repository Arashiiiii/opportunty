import type { Metadata } from "next";
import { LegalPage } from "../_components/LegalPage";

export const metadata: Metadata = {
  title: "About — opportunity.com",
  description: "opportunity.com gathers jobs from Morocco, Europe and Saudi Arabia and tailors your CV to each offer with AI.",
  alternates: { canonical: "/about" },
};

export default function Page() {
  return <LegalPage slug="about" />;
}
