import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SITE_URL, SITE_NAME, SITE_TITLE, SITE_DESCRIPTION } from "@/lib/site";
import { Analytics } from '@vercel/analytics/next';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_TITLE, template: "%s" },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "job search", "jobs in Morocco", "emploi Maroc", "offres d'emploi", "CV builder", "free CV builder",
    "AI CV tailoring", "ATS CV templates", "créateur de CV", "générateur de CV", "CV gratuit",
    "jobs in France", "jobs in Germany", "jobs in Saudi Arabia", "وظائف المغرب", "سيرة ذاتية",
  ],
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
  openGraph: {
    type: "website", url: SITE_URL, siteName: SITE_NAME, title: SITE_TITLE, description: SITE_DESCRIPTION,
    locale: "en_US", alternateLocale: ["fr_FR", "ar_MA"],
  },
  twitter: { card: "summary_large_image", title: SITE_TITLE, description: SITE_DESCRIPTION },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = { themeColor: "#ff4f00", width: "device-width", initialScale: 1 };

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization", "@id": `${SITE_URL}/#org`, name: SITE_NAME, url: SITE_URL,
      logo: `${SITE_URL}/apple-icon.png`, email: "contact@opportunty.com",
    },
    {
      "@type": "WebSite", "@id": `${SITE_URL}/#website`, url: SITE_URL, name: SITE_NAME,
      description: SITE_DESCRIPTION, inLanguage: ["en", "fr", "ar"], publisher: { "@id": `${SITE_URL}/#org` },
    },
    {
      "@type": "WebApplication", "@id": `${SITE_URL}/#app`, name: `${SITE_NAME} CV builder`, url: `${SITE_URL}/cv/builder`,
      applicationCategory: "BusinessApplication", operatingSystem: "Any", browserRequirements: "Requires JavaScript",
      description: "Free online CV builder with AI tailoring to a job offer and 10 ATS-friendly templates. Pay only to download the PDF.",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD", description: "Free to edit; one-time payment to download a template as PDF." },
      publisher: { "@id": `${SITE_URL}/#org` },
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
