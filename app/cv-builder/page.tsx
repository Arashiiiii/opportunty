import { CvLandingPage, cvLandingMetadata } from "../_lib/cv-landing-page";

export const metadata = cvLandingMetadata("en");

export default function Page() {
  return <CvLandingPage lang="en" />;
}
