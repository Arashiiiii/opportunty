import type { Metadata } from "next";
import { LegalPage } from "../_components/LegalPage";

export const metadata: Metadata = {
  title: "Cookies — opportunty.com",
  description: "The cookies and local storage opportunty.com uses. No advertising or tracking cookies.",
  alternates: { canonical: "/cookies" },
};

export default function Page() {
  return <LegalPage slug="cookies" />;
}
