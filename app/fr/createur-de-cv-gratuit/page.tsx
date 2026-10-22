import { CvLanding } from "../../_components/CvLanding";
import { cvLandingMetadata } from "@/lib/cv-landing";

export const metadata = cvLandingMetadata("fr");

export default function Page() {
  return <CvLanding lang="fr" />;
}
