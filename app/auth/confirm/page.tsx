import { Suspense } from "react";
import ConfirmClient from "./ConfirmClient";

export const metadata = { title: "Confirm — opportunty.", robots: { index: false } };

export default function Page() {
  return <Suspense fallback={null}><ConfirmClient /></Suspense>;
}
