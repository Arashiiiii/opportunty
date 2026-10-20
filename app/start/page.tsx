import type { Metadata } from "next";
import StartClient from "./StartClient";

export const metadata: Metadata = {
  title: "Upload your CV — opportunty.",
  description: "Téléversez votre CV, adaptez-le à une offre en un clic. · ارفع سيرتك الذاتية وخصّصها لأي عرض عمل.",
  robots: { index: false },
};

export default function StartPage() {
  return <StartClient />;
}
