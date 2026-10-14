import type { Metadata } from "next";
import { LegalPage } from "../_components/LegalPage";

export const metadata: Metadata = { title: "Cookies — opportunity.com" };

export default function Page() {
  return <LegalPage slug="cookies" />;
}
