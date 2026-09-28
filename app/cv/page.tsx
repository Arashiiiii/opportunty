import CVListPageClient from "./CVListPageClient";

export const metadata = {
  title: "Your CVs — opportunity.com",
  description: "Build and tailor your CV, then match it against live job listings.",
};

export default function CVPage() {
  return <CVListPageClient />;
}
