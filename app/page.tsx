import HomeClient from "./HomeClient";

export const metadata = {
  title: "opportunity.com — Job search & AI CV builder",
  description: "Search open roles across Morocco, then drag one into your CV and let AI tailor it to the job.",
};

export default function Home() {
  return <HomeClient />;
}
