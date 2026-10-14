import type { Metadata } from "next";
import { ContactClient } from "./ContactClient";

export const metadata: Metadata = { title: "Contact — opportunity.com" };

export default function Page() {
  return <ContactClient />;
}
