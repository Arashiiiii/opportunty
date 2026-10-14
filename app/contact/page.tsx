import type { Metadata } from "next";
import { ContactClient } from "./ContactClient";

export const metadata: Metadata = {
  title: "Contact — opportunity.com",
  description: "Contact opportunity.com: questions, feedback, job offers to report, privacy requests or partnerships.",
  alternates: { canonical: "/contact" },
};

export default function Page() {
  return <ContactClient />;
}
