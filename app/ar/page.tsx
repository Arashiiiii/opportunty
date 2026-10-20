import HomeClient from "../HomeClient";
import { LangProvider } from "../_lib/useUiLang";
import { homeMetadata } from "@/lib/site-i18n";

export const metadata = homeMetadata("ar");

export default function Page() {
  return <LangProvider lang="ar"><HomeClient /></LangProvider>;
}
