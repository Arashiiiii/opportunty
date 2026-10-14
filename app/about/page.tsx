import type { Metadata } from "next";
import { LegalPage } from "../_components/LegalPage";

export const metadata: Metadata = { title: "About — opportunity.com" };

export default function Page() {
  return <LegalPage slug="about" />;
}
