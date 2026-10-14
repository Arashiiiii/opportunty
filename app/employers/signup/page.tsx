import { EmployerAuth } from "../_EmployerAuth";

export const metadata = { title: "Create an employer account — opportunity.com" };

export default function EmployerSignupPage() {
  return <EmployerAuth mode="signup" />;
}
