import { EmployerAuth } from "../_EmployerAuth";

export const metadata = { title: "Employer sign in — opportunity.com" };

export default function EmployerLoginPage() {
  return <EmployerAuth mode="login" />;
}
