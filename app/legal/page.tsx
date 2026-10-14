import type { Metadata } from "next";
import { LegalPage } from "../_components/LegalPage";

export const metadata: Metadata = { title: "Legal notice — opportunity.com" };

export default function Page() {
  return <LegalPage slug="legal" />;
}
