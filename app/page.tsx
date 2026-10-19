import { HomePage, homeMetadata } from "./_lib/home-page";

export const revalidate = 1800;
export const metadata = homeMetadata("en");

export default function Home() {
  // "/" is the English URL for search engines, but visitors keep the language they picked before.
  return <HomePage lang={null} />;
}
