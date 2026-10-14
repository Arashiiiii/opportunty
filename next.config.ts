import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // mammoth reads its own files at runtime, so keep it out of the bundle.
  // (PDFs use unpdf, which needs no worker file — see api/cv/parse.)
  serverExternalPackages: ["mammoth"],
};

export default nextConfig;
