import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdf.js loads its worker file by path at runtime; bundling it breaks that
  // lookup ("Setting up fake worker failed"), which made every PDF upload fail.
  serverExternalPackages: ["pdf-parse", "pdfjs-dist", "mammoth"],
};

export default nextConfig;
