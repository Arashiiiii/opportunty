import HomeClient from "../HomeClient";
import { LangProvider } from "../_lib/useUiLang";
import { homeMetadata } from "@/lib/site-i18n";

export const metadata = homeMetadata("fr");

export default function Page() {
  return <LangProvider lang="fr"><HomeClient /></LangProvider>;
}
