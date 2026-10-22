import { CvLanding } from "../_components/CvLanding";
import { cvLandingMetadata } from "@/lib/cv-landing";

export const metadata = cvLandingMetadata("en");

export default function Page() {
  return <CvLanding lang="en" />;
}
