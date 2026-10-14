import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "opportunity.com — Jobs & AI CV builder",
    short_name: "opportunity",
    description: "Find jobs and build a tailored CV with AI.",
    start_url: "/",
    display: "standalone",
    background_color: "#fffefb",
    theme_color: "#ff4f00",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }, { src: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  };
}
