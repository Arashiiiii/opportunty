import { HomePage, homeMetadata } from "../_lib/home-page";

export const revalidate = 1800;
export const metadata = homeMetadata("ar");

export default function Home() {
  return <HomePage lang="ar" />;
}
