import { HomePage, homeMetadata } from "../_lib/home-page";

export const revalidate = 1800;
export const metadata = homeMetadata("fr");

export default function Home() {
  return <HomePage lang="fr" />;
}
