import type { Metadata } from "next";
import { LegalPage } from "../_components/LegalPage";

export const metadata: Metadata = {
  title: "Cookies — opportunity.com",
  description: "The cookies and local storage opportunity.com uses. No advertising or tracking cookies.",
  alternates: { canonical: "/cookies" },
};

export default function Page() {
  return <LegalPage slug="cookies" />;
}
