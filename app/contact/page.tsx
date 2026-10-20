import type { Metadata } from "next";
import { ContactClient } from "./ContactClient";

export const metadata: Metadata = {
  title: "Contact — opportunty.com",
  description: "Contact opportunty.com: questions, feedback, job offers to report, privacy requests or partnerships.",
  alternates: { canonical: "/contact" },
};

export default function Page() {
  return <ContactClient />;
}
