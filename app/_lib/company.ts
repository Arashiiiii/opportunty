/**
 * Public company details shown in the footer and legal pages.
 * Fill the empty values before launch — empty fields are simply hidden.
 */
export const COMPANY = {
  brand: "opportunty.com",
  domain: "opportunty.com",
  contactEmail: "contact@opportunty.com",
  privacyEmail: "privacy@opportunty.com",
  /** Legal name of the publisher (person or company). */
  publisher: "Reda",
  legalForm: "",      // e.g. "SARL", "Auto-entrepreneur"
  registration: "",   // e.g. RC / ICE / SIRET number
  address: "",        // postal address
  phone: "",
  host: "Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, USA",
  jurisdiction: { en: "Morocco", fr: "le Maroc", ar: "المغرب" },
} as const;
