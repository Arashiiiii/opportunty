import HomeClient from "./HomeClient";
import { homeMetadata } from "@/lib/site-i18n";

export const metadata = homeMetadata("en");

export default function Home() {
  return <HomeClient />;
}
