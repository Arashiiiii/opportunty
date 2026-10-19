import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SITE_URL, SITE_NAME, SITE_TITLE, SITE_DESCRIPTION } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_TITLE, template: "%s" },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
  // No url/title here: each page sets its own, and a site-wide og:url would point every page at the homepage.
  openGraph: { type: "website", siteName: SITE_NAME, locale: "en_US", alternateLocale: ["fr_FR", "ar_MA"] },
  // Card type only: X/Twitter falls back to each page's own og:title / og:description.
  twitter: { card: "summary_large_image" },
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
      "@type": "WebApplication", "@id": `${SITE_URL}/#app`, name: `${SITE_NAME} CV builder`, url: `${SITE_URL}/cv-builder`,
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
