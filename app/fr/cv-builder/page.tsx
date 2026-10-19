import { CvLandingPage, cvLandingMetadata } from "../../_lib/cv-landing-page";

export const metadata = cvLandingMetadata("fr");

export default function Page() {
  return <CvLandingPage lang="fr" />;
}
