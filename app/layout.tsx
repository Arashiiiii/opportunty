import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "opportunity.com — Job search & AI CV builder",
  description: "A job feed and a live CV builder side by side. Drag a job onto your CV and let AI tailor it to match.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
